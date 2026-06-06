# Group Recommendation Algorithm

## 1. Purpose

The group recommendation algorithm is used in the **Find Teammates** feature.

After a student selects a course, the system retrieves all joinable groups for that course and ranks them based on a rule-based recommendation score.

A group is considered joinable only if:

1. the group status is open,
2. the group is not full,
3. the recruitment deadline has not passed.

The goal of this algorithm is not to train a machine learning model. Instead, it provides a simple, transparent, and explainable ranking method for recommending suitable groups to students.

---

## 2. Design Overview

The recommendation process is divided into two responsibilities:

### StudentIdParser

`StudentIdParser` is responsible only for parsing student IDs.

It converts a student ID into structured information, such as program level, admission year, department code, class code, seat number, and college code.

It does not calculate recommendation scores.

### GroupRecommendationService

`GroupRecommendationService` is responsible for calculating recommendation scores and sorting groups.

It uses the parsed student ID information to compare the applying student with the group leader and current group members.

This separation keeps the design reusable. Other features can also use `StudentIdParser` without being forced to follow the same scoring rules.

---

## 3. Student ID Format

The system assumes that each student ID follows this format:

```text
41271122H
```
The student ID is parsed as follows:

| Position           | Example | Meaning         |
| ------------------ | ------- | --------------- |
| 1st character      | `4`     | Program level   |
| 2nd-3rd characters | `12`    | Admission year  |
| 4th-5th characters | `71`    | Department code |
| 6th character      | `1`     | Class code      |
| 7th-8th characters | `22`    | Seat number     |
| 9th character      | `H`     | College code    |

Program level examples:

| Code | Meaning  |
| ---- | -------- |
| `4`  | Bachelor |
| `6`  | Master   |
| `8`  | PhD      |

Example:
```text
41271122H
```

This student ID means:

```text
Program level: Bachelor
Admission year: 112 academic year
Department code: 71
Class code: 1
Seat number: 22
College code: H
```

## 4. StudentIdParser Responsibility

`StudentIdParser` only parses the student ID.

Example output:

```python
{
    "program_level": "bachelor",
    "program_level_code": "4",
    "admission_year": 12,
    "department": "71",
    "class_code": "1",
    "seat_number": "22",
    "college": "H"
}
```

The parser does not decide how many points should be given for same department, same class, or same admission year.

Those scoring rules are defined in `GroupRecommendationService`.

This design follows the single responsibility principle:
```text
StudentIdParser: understands the structure of student IDs
GroupRecommendationService: decides how student ID information affects ranking
```
## 5. Similarity Score
GroupRecommendationService calculates similarity scores between two students based on their parsed student ID information.

The current scoring rules are:

| Condition                   | Score |
| --------------------------- | ----: |
| Same department             |   +20 |
| Same admission year         |   +10 |
| Admission year differs by 1 |    +5 |
| Same program level          |    +5 |
| Same class                  |    +5 |
| Same college                |    +3 |

The department has the highest weight because students from the same department are more likely to have similar academic backgrounds, course expectations, and project needs.

## 6. Leader and Member Similarity
For each group, the system compares the applying student with:
1. the group leader,
2. the existing non-leader members.

The leader is given a slightly higher weight because the leader usually creates the group, manages the group information, and reviews applications.

The group similarity score is calculated as:
```text
group_similarity_score =
(1.2 × leader_similarity_score + average_member_similarity_score) / 2.2
```
The value 1.2 is used as a moderate leader weight. It makes the leader slightly more influential than other members, but it does not make the recommendation depend only on the leader.

The value 2.2 is the sum of the weights:
```text
1.2 + 1.0 = 2.2
```
Therefore, the formula is a weighted average.

## 7. Average Member Similarity
The average member similarity is calculated using only non-leader members.
The leader is excluded because the leader similarity is already calculated separately.
```text
average_member_similarity_score =
sum(similarity between applicant and each non-leader member)
/ number of non-leader members
```
If the group only has a leader and no other members, then:
```text
average_member_similarity_score = leader_similarity_score
```
This avoids unfairly lowering the score of newly created groups.

## 8. Available Slot Score
The system also considers how many seats are still available in the group.
```text
available_slots = max_members - len(members)
```
The available slot score is:
```text
available_slot_score = 2 × available_slots
```
This gives a small bonus to groups with more available seats.

However, this score is intentionally smaller than the student similarity score because having more available seats does not necessarily mean the group is a better match.

## 9. Deadline Bonus
The system gives a small bonus to groups that are close to their recruitment deadline.

| Deadline condition                   | Bonus |
| ------------------------------------ | ----: |
| Deadline is within 1 day             |    +5 |
| Deadline is within 3 days            |    +3 |
| No deadline or more than 3 days left |    +0 |

## 10. Final Score Formula
The final recommendation score is:
```text
final_score =
(1.2 × leader_similarity_score + average_member_similarity_score) / 2.2
+ 2 × available_slots
+ deadline_bonus
```
Groups with higher scores are displayed earlier.

## 11. Example
Applying student:
```text
41271122H
```
Group:
```text
leader_id = 41271105H
members = ["41271105H", "41271218H", "61271103H"]
max_members = 4
```
Leader Similarity

Applicant: `41271122H`

Leader: `41271105H`

They have:
```text
Same program level: +5
Same admission year: +10
Same department: +20
Same class: +5
Same college: +3
```
Therefore,
```text
leader_similarity_score = 43
```
### Member Similarity
Non-leader members:
```text
41271218H
61271103H
```
Assume their similarity scores are:
```text
38 and 38
```
Then:
```text
average_member_similarity_score = (38 + 38) / 2 = 38
```
### Available Slot Score
```text
available_slots = 4 - 3 = 1
available_slot_score = 2 × 1 = 2
```
### Deadline Bonus
Assume the deadline bonus is:
```text
deadline_bonus = 3
```
### Final Score
```text
final_score =
(1.2 × 43 + 38) / 2.2
+ 2
+ 3
```

```text
final_score =
(51.6 + 38) / 2.2
+ 5
```

```text
final_score =
40.73 + 5
= 45.73
```

## 12. Algorithm Steps
```text
1. Student selects a course.
2. The system retrieves all joinable groups for the selected course.
3. For each group:
   a. Parse the applicant's student ID.
   b. Parse the group leader's student ID.
   c. Calculate leader similarity score.
   d. Parse each non-leader member's student ID.
   e. Calculate average member similarity score.
   f. Calculate available slot score.
   g. Calculate deadline bonus.
   h. Calculate final score.
4. Sort groups by final score in descending order.
5. Return the sorted group list.
```

## 13. Time Complexity
Let:
```text
n = number of joinable groups
m = average number of members in each group
```
For each group, the system compares the applicant with the group leader and current members.

The score calculation takes:
```text
O(n × m)
```
Sorting all groups takes:
```text
O(n log n)
```
Hence, the total time complexity is:
```text
O(n × m + n log n)
```
Since project groups usually contain only a small number of members, the algorithm is efficient enough for this use case.

## 14. Space Complexity
The system stores the list of joinable groups and sorts them.

Therefore, the space complexity is:
```text
O(n)
```
## 15. Design Rationale
This algorithm is rule-based.

The responsibility of each component:

| Component               | Responsibility                                                         |
| ----------------------- | ---------------------------------------------------------------------- |
| `StudentIdParser`       | Parses student IDs into structured information                         |
| `GroupRecommendationService` | Calculates recommendation scores and sorts groups                      |
| `GroupRepository`       | Retrieves joinable groups from the database                            |
| `Group`                 | Encapsulates group rules such as whether the group is full or joinable |
