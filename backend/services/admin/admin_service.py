from repository.group_repository import GroupRepository
from repository.reply_repository import ReplyRepository
from repository.discussion_repository import DiscussionRepository
from repository.report_repository import ReportRepository
from repository.review_repository import ReviewRepository


class ReviewReportHandler:
    """Handles reports whose target is a course review."""

    reported_type = "review"

    def __init__(
        self,
        review_repo: ReviewRepository,
        rating_synchronizer=None,
    ):
        self.review_repo = review_repo
        self.rating_synchronizer = rating_synchronizer

    def get_content(self, reported_id: str):
        review = self.review_repo.find_by_id(reported_id)
        return review.to_dict() if review else None

    def process(
        self,
        reported_id: str,
        decision: str,
    ):
        # Map admin decisions to review-specific actions.
        decision_handlers = {
            "DELETE_REVIEW": self._delete_review,
            "HIDE_REVIEW": self._hide_review,
        }

        handler = decision_handlers.get(decision)

        if not handler:
            raise ValueError(
                "Invalid decision for review report. Must be DELETE_REVIEW, HIDE_REVIEW, or DISMISS_REPORT."
            )

        return handler(reported_id)

    def _delete_review(
        self,
        reported_id: str,
    ):
        review = self.review_repo.find_by_id(reported_id)
        if not review:
            raise LookupError("Content not found")

        self.review_repo.delete_by_id(reported_id)
        self._recalculate_course_ratings(review.courseID)
        return "deleted"

    def _hide_review(
        self,
        reported_id: str,
    ):
        review = self.review_repo.find_by_id(reported_id)
        if not review:
            raise LookupError("Content not found")

        self.review_repo.hide_review(reported_id)
        self._recalculate_course_ratings(review.courseID)
        return "hidden"

    def _recalculate_course_ratings(self, course_id: str | None):
        if not course_id or not self.rating_synchronizer:
            return

        self.rating_synchronizer.review_changed(course_id)


class CommentReportHandler:
    """Handles reports whose target is a discussion reply."""

    reported_type = "comment"

    def __init__(
        self,
        reply_repo: ReplyRepository = None,
        discussion_repo: DiscussionRepository = None,
    ):
        self.reply_repo = reply_repo
        self.discussion_repo = discussion_repo

    def get_content(self, reported_id: str):
        if not self.reply_repo:
            raise ValueError("Reply repository is not configured.")

        reply = self.reply_repo.find_by_id_or_legacy_id(reported_id)
        return reply.to_dict() if reply else None

    def process(
        self,
        reported_id: str,
        decision: str,
    ):
        if not self.reply_repo:
            raise ValueError("Reply repository is not configured.")

        decision_handlers = {
            "DELETE_COMMENT": self._delete_comment,
            "HIDE_COMMENT": self._hide_comment,
        }

        handler = decision_handlers.get(decision)

        if not handler:
            raise ValueError(
                f"Invalid decision for comment report. Must be one of: {list(decision_handlers)}"
            )

        return handler(reported_id)

    def _delete_comment(
        self,
        reported_id: str,
    ):
        reply = self.reply_repo.find_by_id_or_legacy_id(reported_id)
        if not reply:
            raise LookupError("Content not found")
        if self.reply_repo.delete_reply(reported_id):
            self._decrement_discussion_reply_count(reply)
        return "deleted"

    def _hide_comment(
        self,
        reported_id: str,
    ):
        if not self.reply_repo.find_by_id_or_legacy_id(reported_id):
            raise LookupError("Content not found")
        self.reply_repo.hide_reply(reported_id)
        return "hidden"

    def _decrement_discussion_reply_count(self, reply):
        if not reply or not self.discussion_repo:
            return

        self.discussion_repo.increment_reply_count(reply.discussionID, -1)


class TeammatePostReportHandler:
    """Handles reports whose target is a teammate recruitment post."""

    reported_type = "teammate_post"

    def __init__(
        self,
        group_repo: GroupRepository = None,
    ):
        self.group_repo = group_repo

    def get_content(self, reported_id: str):
        if not self.group_repo:
            raise ValueError("Group repository is not configured.")

        group = self.group_repo.find_by_id_or_legacy_id(reported_id)
        return group.to_dict() if group else None

    def process(
        self,
        reported_id: str,
        decision: str,
    ):
        if not self.group_repo:
            raise ValueError("Group repository is not configured.")

        decision_handlers = {
            "DELETE_TEAMMATE_POST": self._delete_teammate_post,
            "HIDE_TEAMMATE_POST": self._hide_teammate_post,
        }

        handler = decision_handlers.get(decision)

        if not handler:
            raise ValueError(
                f"Invalid decision for teammate_post report. Must be one of: {list(decision_handlers)}"
            )

        return handler(reported_id)

    def _delete_teammate_post(
        self,
        reported_id: str,
    ):
        if not self.group_repo.find_by_id_or_legacy_id(reported_id):
            raise LookupError("Content not found")
        self.group_repo.delete_by_id(reported_id)
        return "deleted"

    def _hide_teammate_post(
        self,
        reported_id: str,
    ):
        if not self.group_repo.find_by_id_or_legacy_id(reported_id):
            raise LookupError("Content not found")
        self.group_repo.hide_by_id(reported_id)
        return "hidden"


class AdminService:
    """Coordinates admin report review workflows."""

    def __init__(
        self,
        report_repo: ReportRepository,
        review_repo: ReviewRepository,
        reply_repo: ReplyRepository = None,
        discussion_repo: DiscussionRepository = None,
        group_repo: GroupRepository = None,
        rating_synchronizer=None,
    ):
        self.report_repo = report_repo
        # Registry keeps report-type dispatch out of process_report().
        self.report_handlers = {
            ReviewReportHandler.reported_type: ReviewReportHandler(
                review_repo=review_repo,
                rating_synchronizer=rating_synchronizer,
            ),
            CommentReportHandler.reported_type: CommentReportHandler(
                reply_repo=reply_repo,
                discussion_repo=discussion_repo,
            ),
            TeammatePostReportHandler.reported_type: TeammatePostReportHandler(
                group_repo=group_repo,
            ),
        }

    def get_report_queue(self):
        """Return pending reports for admin review."""
        return self.report_repo.find_pending_reports()

    def get_all_reports(self):
        """Return all reports, including resolved and dismissed reports."""
        return self.report_repo.find_all_reports()

    def get_report_content(self, report_id: str):
        """Return the content targeted by a report."""
        report = self._get_report_or_raise(report_id)
        reported_type, reported_id = self._get_report_target(report)
        handler = self._get_handler(reported_type)
        content = handler.get_content(reported_id)

        if not content:
            raise LookupError("Content not found")

        return {
            "reported_type": reported_type,
            "reported_id": reported_id,
            "content": content,
        }

    def process_report(
        self,
        report_id: str,
        decision: str,
        handler_id: str,
        resolution: str = None,
    ):
        """Apply an admin decision to a report."""
        report = self._get_report_or_raise(report_id)
        if not report.is_pending():
            raise ValueError("Only pending reports can be processed.")
        reported_type, reported_id = self._get_report_target(report)

        if decision == "DISMISS_REPORT":
            report.dismiss(handler_id, resolution or "dismissed")
            self.report_repo.save(report)
            return report

        handler = self._get_handler(reported_type)
        action_resolution = handler.process(
            reported_id=reported_id,
            decision=decision,
        )
        report.resolve(handler_id, resolution or action_resolution)
        self.report_repo.save(report)
        return report

    def _get_report_or_raise(self, report_id: str):
        report = self.report_repo.find_by_id(report_id)

        if not report:
            raise LookupError("Report not found")

        return report

    def _get_report_target(self, report):
        reported_type = report.reported_type
        reported_id = report.reported_id

        if not reported_type or not reported_id:
            raise ValueError("Invalid report target")

        return reported_type, reported_id

    def _get_handler(self, reported_type: str):
        handler = self.report_handlers.get(reported_type)

        if not handler:
            raise ValueError("Invalid reported_type")

        return handler
