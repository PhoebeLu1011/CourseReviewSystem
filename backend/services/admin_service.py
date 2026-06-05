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
        report_repo: ReportRepository,
        review_repo: ReviewRepository,
        course_service=None,
    ):
        self.report_repo = report_repo
        self.review_repo = review_repo
        self.course_service = course_service

    def get_content(self, reported_id: str):
        review = self.review_repo.find_by_id(reported_id)
        return review.to_dict() if review else None

    def process(
        self,
        report_id: str,
        reported_id: str,
        decision: str,
        handler_id: str,
        resolution: str = None,
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

        handler(report_id, reported_id, handler_id, resolution)

    def _delete_review(
        self,
        report_id: str,
        reported_id: str,
        handler_id: str,
        resolution: str = None,
    ):
        review = self.review_repo.find_by_id(reported_id)
        course_id = review.courseID if review else None

        self.review_repo.delete_by_id(reported_id)
        self._recalculate_course_ratings(course_id)

        self.report_repo.update_status(
            report_id=report_id,
            status="RESOLVED",
            handler_id=handler_id,
            resolution=resolution or "deleted",
        )

    def _hide_review(
        self,
        report_id: str,
        reported_id: str,
        handler_id: str,
        resolution: str = None,
    ):
        review = self.review_repo.find_by_id(reported_id)
        course_id = review.courseID if review else None

        self.review_repo.hide_review(reported_id)
        self._recalculate_course_ratings(course_id)

        self.report_repo.update_status(
            report_id=report_id,
            status="RESOLVED",
            handler_id=handler_id,
            resolution=resolution or "hidden",
        )

    def _recalculate_course_ratings(self, course_id: str | None):
        if not course_id or not self.course_service:
            return

        try:
            self.course_service.recalculate_course_ratings(
                course_id,
                self.review_repo,
            )
        except Exception as e:
            print(f"Warning: Could not recalculate ratings: {e}")


class CommentReportHandler:
    """Handles reports whose target is a discussion reply."""

    reported_type = "comment"

    def __init__(
        self,
        report_repo: ReportRepository,
        reply_repo: ReplyRepository = None,
        discussion_repo: DiscussionRepository = None,
    ):
        self.report_repo = report_repo
        self.reply_repo = reply_repo
        self.discussion_repo = discussion_repo

    def get_content(self, reported_id: str):
        if not self.reply_repo:
            raise ValueError("Reply repository is not configured.")

        reply = self.reply_repo.find_by_id_or_legacy_id(reported_id)
        return reply.to_dict() if reply else None

    def process(
        self,
        report_id: str,
        reported_id: str,
        decision: str,
        handler_id: str,
        resolution: str = None,
    ):
        if not self.reply_repo:
            raise ValueError("Reply repository is not configured.")

        decision_handlers = {
            "DELETE_COMMENT": self._delete_comment,
            "HIDE_COMMENT": self._hide_comment,
            "RESOLVE_COMMENT": self._resolve_comment,
        }

        handler = decision_handlers.get(decision)

        if not handler:
            raise ValueError(
                f"Invalid decision for comment report. Must be one of: {list(decision_handlers)}"
            )

        handler(report_id, reported_id, handler_id, resolution)

    def _delete_comment(
        self,
        report_id: str,
        reported_id: str,
        handler_id: str,
        resolution: str = None,
    ):
        reply = self.reply_repo.find_by_id_or_legacy_id(reported_id)
        self.reply_repo.delete_reply(reported_id)
        self._decrement_discussion_reply_count(reply)
        self._resolve_comment(report_id, reported_id, handler_id, resolution or "deleted")

    def _hide_comment(
        self,
        report_id: str,
        reported_id: str,
        handler_id: str,
        resolution: str = None,
    ):
        self.reply_repo.hide_reply(reported_id)
        self._resolve_comment(report_id, reported_id, handler_id, resolution or "hidden")

    def _resolve_comment(
        self,
        report_id: str,
        reported_id: str,
        handler_id: str,
        resolution: str = None,
    ):
        self.report_repo.update_status(
            report_id=report_id,
            status="RESOLVED",
            handler_id=handler_id,
            resolution=resolution or "resolved",
        )

    def _decrement_discussion_reply_count(self, reply):
        if not reply or not self.discussion_repo:
            return

        discussion = self.discussion_repo.find_discussion_by_id(reply.discussionID)
        if not discussion:
            return

        discussion.replyCount = max(0, discussion.replyCount - 1)
        self.discussion_repo.save_discussion(discussion)


class TeammatePostReportHandler:
    """Handles reports whose target is a teammate recruitment post."""

    reported_type = "teammate_post"

    def __init__(
        self,
        report_repo: ReportRepository,
        group_repo: GroupRepository = None,
    ):
        self.report_repo = report_repo
        self.group_repo = group_repo

    def get_content(self, reported_id: str):
        if not self.group_repo:
            raise ValueError("Group repository is not configured.")

        group = self.group_repo.find_by_id_or_legacy_id(reported_id)
        return group.to_dict() if group else None

    def process(
        self,
        report_id: str,
        reported_id: str,
        decision: str,
        handler_id: str,
        resolution: str = None,
    ):
        if not self.group_repo:
            raise ValueError("Group repository is not configured.")

        decision_handlers = {
            "DELETE_TEAMMATE_POST": self._delete_teammate_post,
            "HIDE_TEAMMATE_POST": self._hide_teammate_post,
            "RESOLVE_TEAMMATE_POST": self._resolve_teammate_post,
        }

        handler = decision_handlers.get(decision)

        if not handler:
            raise ValueError(
                f"Invalid decision for teammate_post report. Must be one of: {list(decision_handlers)}"
            )

        handler(report_id, reported_id, handler_id, resolution)

    def _delete_teammate_post(
        self,
        report_id: str,
        reported_id: str,
        handler_id: str,
        resolution: str = None,
    ):
        self.group_repo.delete_by_id(reported_id)
        self._resolve_teammate_post(report_id, reported_id, handler_id, resolution or "deleted")

    def _hide_teammate_post(
        self,
        report_id: str,
        reported_id: str,
        handler_id: str,
        resolution: str = None,
    ):
        self.group_repo.hide_by_id(reported_id)
        self._resolve_teammate_post(report_id, reported_id, handler_id, resolution or "hidden")

    def _resolve_teammate_post(
        self,
        report_id: str,
        reported_id: str,
        handler_id: str,
        resolution: str = None,
    ):
        self.report_repo.update_status(
            report_id=report_id,
            status="RESOLVED",
            handler_id=handler_id,
            resolution=resolution or "resolved",
        )


class AdminService:
    """Coordinates admin report review workflows."""

    def __init__(
        self,
        report_repo: ReportRepository,
        review_repo: ReviewRepository,
        reply_repo: ReplyRepository = None,
        discussion_repo: DiscussionRepository = None,
        group_repo: GroupRepository = None,
        course_service=None,
    ):
        self.report_repo = report_repo
        # Registry keeps report-type dispatch out of process_report().
        self.report_handlers = {
            ReviewReportHandler.reported_type: ReviewReportHandler(
                report_repo=report_repo,
                review_repo=review_repo,
                course_service=course_service,
            ),
            CommentReportHandler.reported_type: CommentReportHandler(
                report_repo=report_repo,
                reply_repo=reply_repo,
                discussion_repo=discussion_repo,
            ),
            TeammatePostReportHandler.reported_type: TeammatePostReportHandler(
                report_repo=report_repo,
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
        reported_type, reported_id = self._get_report_target(report)

        if decision == "DISMISS_REPORT":
            self._dismiss_report(report_id, handler_id, resolution)
            return self.report_repo.find_by_id(report_id)

        handler = self._get_handler(reported_type)
        handler.process(
            report_id=report_id,
            reported_id=reported_id,
            decision=decision,
            handler_id=handler_id,
            resolution=resolution,
        )

        return self.report_repo.find_by_id(report_id)

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

    def _dismiss_report(
        self,
        report_id: str,
        handler_id: str,
        resolution: str = None,
    ):
        self.report_repo.update_status(
            report_id=report_id,
            status="DISMISSED",
            handler_id=handler_id,
            resolution=resolution or "dismissed",
        )
