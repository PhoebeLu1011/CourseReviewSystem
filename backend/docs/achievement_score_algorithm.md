# Achievement Badge Calculation Algorithm

## 1. Overview

The Achievement Badge system automatically evaluates whether a student has earned badges based on their activity records on the platform.

The current version uses three behavior counts:

| Field | Meaning |
|---|---|
| `reviewCount` | The number of course reviews created by the student |
| `replyCount` | The number of replies created by the student |
| `applyCount` | The number of group applications submitted by the student |

Whenever a student completes a related action, the system checks the badge requirements again and updates the highest-level badge the student currently owns in each category.

---

## 2. Badge Categories

Badges are divided into categories according to the type of contribution.

| Category | Main Condition |
|---|---|
| `reviewer` | Evaluated by `reviewCount` |
| `replier` | Evaluated by `replyCount` |
| `group_participant` | Evaluated by `applyCount` |
| `contributor` | Evaluated by overall contribution, using `achievement_score``reviewCount` `replyCount` |

---

## 3. Achievement Score

`achievement_score` is mainly used for the `contributor` badge category.

It represents the student's overall contribution across multiple platform activities. The score is calculated as follows:

```python
achievement_score = reviewCount * 2 + replyCount * 1 + applyCount * 1
```

### Weight Design

| Behavior | Weight | Reason |
|---|---:|---|
| `reviewCount` | 2 | Course reviews directly provide course information, so they receive a higher weight. |
| `replyCount` | 1 | Replies support discussion and interaction. |
| `applyCount` | 1 | Group applications show participation in the group-finding feature. |

Reviewer, Replier, and Group Participant badges are mainly evaluated by their own behavior counts. The `achievement_score` is mainly used for Contributor badges because Contributor badges represent overall platform contribution rather than a single action.

---

## 4. Badge Rules

Each badge has its own requirements. A student earns a badge only when all requirements of that badge are satisfied.

| Badge ID | Badge Name | Category | Requirements | Level |
|---|---|---|---|---|
| `first_reviewer` | First Reviewer | `reviewer` | `reviewCount >= 1` | 1 |
| `active_reviewer` | Active Reviewer | `reviewer` | `reviewCount >= 5` | 2 |
| `senior_reviewer` | Senior Reviewer | `reviewer` | `reviewCount >= 10` | 3 |
| `first_replier` | First Replier | `replier` | `replyCount >= 1` | 1 |
| `helpful_replier` | Helpful Replier | `replier` | `replyCount >= 3` | 2 |
| `group_explorer` | Group Explorer | `group_participant` | `applyCount >= 1` | 1 |
| `active_group_seeker` | Active Group Seeker | `group_participant` | `applyCount >= 3` | 2 |
| `junior_contributor` | Junior Contributor | `contributor` | `reviewCount >= 1`, `replyCount >= 1`, `achievement_score >= 3` | 1 |
| `community_contributor` | Community Contributor | `contributor` | `reviewCount >= 3`, `replyCount >= 3`, `achievement_score >= 9` | 2 |
| `senior_contributor` | Senior Contributor | `contributor` | `reviewCount >= 5`, `replyCount >= 5`, `achievement_score >= 15` | 3 |

---

## 5. Badge Replacement Rule

The system uses category-based badge replacement.

This means:

> Within the same category, a student only keeps the highest-level badge they have achieved.

For example, if the student's current badge is:

```json
{
    "reviewer": "first_reviewer"
}
```

and the student later satisfies the requirements for `active_reviewer`, the system updates the badge record to:

```json
{
    "reviewer": "active_reviewer"
}
```

The Level 2 badge replaces the Level 1 badge in the same category.

Badges from different categories do not replace each other. For example:

```json
{
    "reviewer": "active_reviewer",
    "replier": "first_replier",
    "group_participant": "group_explorer",
    "contributor": "junior_contributor"
}
```

---

## 6. Badge Calculation Flow

### Input

```text
student
badge rule list
```

### Output

```text
newly awarded badges
updated student.badges
```

### Steps

```text
1. Read the student's current reviewCount, replyCount, and applyCount.

2. Calculate achievement_score.

3. Retrieve all badge rules from BadgeRepository.

4. Check each badge one by one:
   a. Check whether reviewCount satisfies badge.minReviewCount.
   b. Check whether replyCount satisfies badge.minReplyCount.
   c. Check whether applyCount satisfies badge.minApplyCount.
   d. Check whether achievement_score satisfies badge.minAchievementScore.

5. If the student does not satisfy the badge requirements:
   - Skip that badge.

6. If the student satisfies the badge requirements:
   a. Check whether the student already has a badge in the same category.
   b. If not, assign the badge directly.
   c. If yes, compare the level of the current badge and the new badge.
   d. If the new badge has a higher level, replace the current badge with the new badge.

7. Return the badges that were newly earned or upgraded in this check.
```



---

## 8. Example

Assume a student currently has the following behavior counts:

```text
reviewCount = 3
replyCount = 3
applyCount = 1
```

The achievement score is calculated as:

```python
achievement_score = 3 * 2 + 3 * 1 + 1 * 1
achievement_score = 10
```

The system checks all badge rules.

The student satisfies the following badges:

| Category | Badge |
|---|---|
| `reviewer` | `first_reviewer` |
| `replier` | `helpful_replier` |
| `group_participant` | `group_explorer` |
| `contributor` | `community_contributor` |

The final `student.badges` value becomes:

```json
{
    "reviewer": "first_reviewer",
    "replier": "helpful_replier",
    "group_participant": "group_explorer",
    "contributor": "community_contributor"
}
```

---

## 9. When the Algorithm Runs

The Achievement Badge algorithm is currently triggered in the following situations.

### 1. Student creates a review

When a student successfully creates a course review:

```text
reviewCount += 1
run update_student_badges(student)
save student
```

### 2. Student submits a group application

When a student successfully submits a group application:

```text
applyCount += 1
run update_student_badges(student)
save student
```
