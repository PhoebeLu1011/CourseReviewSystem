class GroupDashboardService:
    """Builds the read model used by a student's group management dashboard."""

    def __init__(self, group_repo, application_repo):
        self.group_repo = group_repo
        self.application_repo = application_repo

    def get_dashboard(self, student_id: str) -> dict:
        led_groups = self.group_repo.find_by_leader(student_id)
        member_groups = [
            group
            for group in self.group_repo.find_by_member(student_id)
            if group.leader_id != student_id
        ]
        pending_by_group = self.application_repo.find_pending_by_groups(
            [group.group_id for group in led_groups]
        )

        return {
            "led_groups": [
                {
                    "group": group.to_dict(),
                    "pending_applications": [
                        application.to_dict()
                        for application in pending_by_group.get(group.group_id, [])
                    ],
                }
                for group in led_groups
            ],
            "member_groups": [group.to_dict() for group in member_groups],
            "applications": [
                application.to_dict()
                for application in self.application_repo.find_by_student(student_id)
            ],
        }
