# PRD — Interactive Project Scheduling Learning Experience



Product Requirements Document v1.0

5-member team

Interactive educational experience



Project title: Project Schedule Management — Network Diagrams & Gantt Charts

Core vision: Build a premium, browser-based interactive educational experience that teaches Project Schedule Management through visual exploration, live simulations, calculations, and practical challenges.

This should feel like a professional educational product, not a PowerPoint presentation converted into a website.

The audience should be able to understand the concepts by interacting with them rather than simply reading paragraphs.

# 1. Product vision

## 1.1 The problem

Traditional classroom presentations generally explain Network Diagrams and Gantt Charts using static diagrams, definitions, and examples.

This creates several learning problems:

- Students can memorize definitions without understanding dependencies.
- Critical paths can be difficult to identify visually.
- The relationship between a Network Diagram and a Gantt Chart is not always clear.
- Students often struggle to understand why activities can happen simultaneously.
- CPM calculations become confusing when performed only on a whiteboard.

## 1.2 Our solution

Build an interactive learning environment where viewers can:

1. Understand how a project schedule is developed.
2. Explore activity dependencies.
3. Construct and manipulate a Network Diagram.
4. Calculate the Critical Path and Slack.
5. Explore a Gantt Chart and understand its timeline.
6. Observe how changing one activity affects the entire project.

# The learning experience

[Project Management Network Diagram Activity On Node Network](https://images.openai.com/static-rsc-4/JOt0UKuRoqT2gs9j4ltqoe68O7BkMfQm9pOvgeYzQo531M25EtBflmLJ5p_phNw_eqTlOOKjIPHcpOg-V0Ob-6v4cZ1BE91aXYQ8s9hE1PplEc_u3aN16mZaK1UppXxL9jL6BitmbQrKIg8oGKkgGn7rc7ewp91eFBHp15yBxcI?purpose=inline)

Network Diagram

Understand project logic and dependencies.

[Madi — Real Gantt for modern teams, in a browser](https://images.openai.com/static-rsc-4/EVwuDft80qaxlTruHLcBAm29eLmZZ3NIq4CxyekQW3FD5oU6cxrpDz6raYXaa6koUSnQeuGJWqFalvrm1Nwyg6l0cp3cvdgiOEZVlETBTOMcj3OHDtJywnkDy6ajiNilJtz2BQYVbG6_HAf6CZCxh7QVm9-a9O2U-C1Vfonvjxg?purpose=inline)

Gantt Chart

Understand project timing and progress.

One project, two perspectives

Live connection

The same activities, durations, and dependencies must drive both visualizations.

## 1.3 Product objectives

| Objective           | Expected result                                     |
| ------------------- | --------------------------------------------------- |
| Educational clarity | Concepts explained in simple language               |
| Interactivity       | Every member has a meaningful interactive component |
| Visual quality      | Professional, premium, light UI                     |
| Accuracy            | Correct CPM, dependency and scheduling calculations |
| Engagement          | Viewers learn by experimenting                      |
| Continuity          | All five sections form one coherent experience      |

# 2. Research findings and academic foundation

I reviewed project scheduling references from the Project Management Institute (PMI) and Microsoft documentation, alongside the Chapter 6 material you provided from Kathy Schwalbe's Information Technology Project Management, 9th Edition.

There are several important academic details that should be reflected correctly in the experience.

## 2.1 Project Schedule Management

The six foundational processes should be introduced:

1. Plan Schedule Management

   Establish policies, procedures and documentation for managing the schedule.
2. Define Activities

   Identify the specific work required to produce project deliverables.
3. Sequence Activities

   Determine logical relationships and dependencies.
4. Estimate Activity Durations

   Estimate how long individual activities will take.
5. Develop Schedule

   Calculate and organize the overall project timeline.
6. Control Schedule

   Monitor progress and manage changes to the schedule.

The application should show how these processes lead to the creation and management of a project schedule.

## 2.2 Dependency classification

One important academic distinction:

Dependency types and relationship types are not the same thing.

Dependency classifications:

- Mandatory: Required by the nature of the work.
- Discretionary: Based on preferred practices or chosen sequencing.
- External: Depends on something outside the project.
- Internal: Depends on another activity within the project.

Relationship types:

| Relationship | Meaning          |
| ------------ | ---------------- |
| FS           | Finish-to-Start  |
| SS           | Start-to-Start   |
| FF           | Finish-to-Finish |
| SF           | Start-to-Finish  |

FS is the most common relationship. SF is relatively rare.

The experience should have a visual relationship explorer, where clicking each relationship reveals a small example of how two activities are connected. PMI's scheduling material and precedence diagramming references support these definitions.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.pmi.org\&sz=32)

Project Schedule Terminology+2



## 2.3 Network Diagram

The recommended model is Activity-on-Node (AON).

- Rectangles represent activities.
- Arrows represent logical dependencies.
- Branches represent activities that can occur in parallel.
- Joining arrows represent activities that must wait for multiple predecessors.

The network diagram answers:

What depends on what?

It helps identify the Critical Path and the logical sequence of project work.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.pmi.org\&sz=32)

Project Schedule Terminology+1



## 2.4 Critical Path Method (CPM)

This is one of the most important learning sections.

The Critical Path is the longest-duration path through the project network that determines the earliest possible project completion under the given schedule logic.

The experience should teach:

- Forward Pass
- Backward Pass
- Earliest Start (ES)
- Earliest Finish (EF)
- Latest Start (LS)
- Latest Finish (LF)
- Total Float / Slack
- Critical activities

Core formulas:

\\[ EF = ES + Duration \\]

\\[ LS = LF - Duration \\]

\\[ Total\ Float = LS - ES \\]

The application should use a consistent day-counting convention and clearly explain whether dates are represented as elapsed-time boundaries or inclusive workday numbers.

PMI's CPM calculation material provides the academic foundation for these calculations.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.pmi.org\&sz=32)

Project Schedule Terminology+1



## 2.5 Gantt Chart

A Gantt Chart represents activities as horizontal bars against a time scale.

It communicates:

- Activity names
- Start times
- Finish times
- Duration
- Overlapping activities
- Dependencies
- Progress
- Project milestones

Its primary question is:

When does each activity happen?

Microsoft's documentation confirms that task bars represent activity duration across a timeline and that dependency links connect related tasks.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://support.microsoft.com\&sz=32)

Microsoft Support+2



## 2.6 PERT estimation

Include PERT as a supporting learning concept rather than allowing it to distract from the primary Network Diagram and Gantt Chart topics.

\\[ PERT = \frac{O+4M+P}{6} \\]

Where:

- O = Optimistic duration
- M = Most likely duration
- P = Pessimistic duration

Users should be able to change the three estimates and see the weighted estimate update immediately.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.pmi.org\&sz=32)

Project Management Institute+1



# 3. The central project example

Shared dataset for all five members

This is a crucial architectural and educational decision.

All five members must use the same project example. Otherwise, the presentation will feel like five disconnected presentations.

I recommend using a simple software development project.

Project scenario: Developing a University Management System

| ID | Activity              | Duration | Predecessor |
| -- | --------------------- | -------- | ----------- |
| A  | Requirements Analysis | 3 days   | —           |
| B  | System Design         | 4 days   | A           |
| C  | Database Design       | 3 days   | A           |
| D  | Development           | 6 days   | B, C        |
| E  | Testing               | 3 days   | D           |
| F  | User Training         | 2 days   | E           |

### Network structure

[Scheduling projects: How to determine the critical path using activity slack calculations? | PM Knowledge Center](https://images.openai.com/static-rsc-4/Oji02-Vzyb8PlzErClXZobZADFt4Nr99VI8EGV5tudkFb_n2AELVjepK9dRvdox8zrSygUhjttia78FkGTnkmXVEWeQUpgdBbftZyJMcAwsbi2Fq7cZhIWIc1fXS2xx0PEyZkonCcVMBSpvS5KlU5U7Nosq3EYa5HmbHIXbCyOA?purpose=inline)

[pmknowledgecenter.com](https://www.pmknowledgecenter.com/dynamic_scheduling/baseline/scheduling-projects-how-determine-critical-path-using-activity-slack-calculations?utm_source=chatgpt.com)

### Path calculations

Path 1:

\\[ A \rightarrow B \rightarrow D \rightarrow E \rightarrow F \\]

\\[ 3+4+6+3+2 = 18\ days \\]

Path 2:

\\[ A \rightarrow C \rightarrow D \rightarrow E \rightarrow F \\]

\\[ 3+3+6+3+2 = 17\ days \\]

Project duration

# 18 days

Earliest completion

Critical path

# A–B–D–E–F

Total duration: 18 days

Non-critical activity

# C

Database Design

Activity C total float

# 1 day

Can slip by one day

### Important calculation verification

Using inclusive workday numbering:

| Activity | ES | EF | LS | LF | Float |
| -------- | -- | -- | -- | -- | ----- |
| A        | 1  | 3  | 1  | 3  | 0     |
| B        | 4  | 7  | 4  | 7  | 0     |
| C        | 4  | 6  | 5  | 7  | 1     |
| D        | 8  | 13 | 8  | 13 | 0     |
| E        | 14 | 16 | 14 | 16 | 0     |
| F        | 17 | 18 | 17 | 18 | 0     |

This table should be available interactively, not just as a static image.

Critical learning opportunity: Let viewers increase Activity C's duration from 3 to 4 days. Its slack becomes zero, and both branches become critical paths of 18 days. This makes the meaning of slack immediately understandable.

# 4. Five-member team structure

Core requirement: every member owns an interaction

I recommend dividing the project into five educational modules rather than assigning five people five ordinary speaking topics.

Each member should have:

- A short conceptual explanation.
- A visual demonstration.
- One primary interactive feature.
- One practical example.
- A small knowledge-check activity.

## Member 1 — Introduction to Project Schedule Management

[Your Guide to the Project Management Process: Breaking Down the Phases](https://images.openai.com/static-rsc-4/kCdf0zn3sJT7Hzo9iCGeVQh0eIWuA2vfYBHth5pGn70aTH0ChJa6OlfYqzA0TB7QeUvFDZ-FPKq-3jXoQ24E6VKbUbVB5mszG7KGsT9Sw2Y2Iqv0Z9nJMuWkpz9pYjNAhIauBHcLMWHbmScpcJ3Cqo84oVfdgXYUbh4mEQwNHOo?purpose=inline)

Topic: Understanding Project Schedule Management

Foundation module

Estimated presentation time: 3–4 minutes

Description topics:

1. What is Project Schedule Management?
2. Why is scheduling important?
3. The six schedule management processes.
4. Activities, duration and predecessors.
5. Introduction to the university management system example.

Interactive component: Schedule Process Explorer

Viewers click the six processes to discover their descriptions and outputs.

Suggested interaction

01Plan

02Define

03Sequence

04Estimate

05Develop

06Control

Plan Schedule Management\
Establish the rules and approach for managing the project schedule.

Member 1's objective: Establish the foundation so viewers understand what they are going to learn.

## Member 2 — Activity Dependencies & Relationships

[What Is a Network Diagram in Project Management?](https://images.openai.com/static-rsc-4/cKdP1GC4YWNbWMp4p98-0Eer18-tkgvE09XKPhuuxWhJNutbNwIdcIgoc1l_-QxBfPOZAED1r19bXhE4k4viI3dgMszaBDYptcXDGU4Zi2XoIkNpChUPEWMD7QipuwsXsRNIK4kwRe-nVyk9ryCJ4Fy8CkyuEAjbyvYdWw9XACU?purpose=inline)

Topic: Understanding Activity Dependencies

Logic module

Estimated presentation time: 3–4 minutes

Description topics:

1. What is a dependency?
2. Predecessor and successor activities.
3. Mandatory, discretionary, external and internal dependencies.
4. Four relationship types: FS, SS, FF and SF.
5. Parallel activities and waiting conditions.

Interactive component: Dependency Relationship Lab

Viewers select a relationship and see how it changes the timing relationship between two activities.

Explore the four relationships

FSSSFFSF

## Finish-to-Start

Rule: B cannot start until A finishes.

Practical example

System design begins after requirements analysis is complete.

Implementation note: The final version should animate the relevant start/finish markers for each relationship. The current schematic is only a conceptual preview.

Member 2's objective: Make viewers understand why activities must follow certain logical relationships.

## Member 3 — Network Diagram

[6.5 일정 개발 - 실전 프로젝트 관리 (PMBOK 6판)](https://images.openai.com/static-rsc-4/XCiVGuXM_eSnOJvzb5ZHpfLaoNXMo7ad6jXMIi-Xb4qG0FOxx2IHk2XWWSAM3zM10GFfDZ6892yPn9mMr6kVR1L-RE3lKzK96gBcbgc1d4GLWtZzRG0PiTFDPXxkEiNfZnRkKahkFgCfbXrvbtxPOPStiMK6s7oa9SKTWUovPGI?purpose=inline)

Topic: Understanding and Constructing a Network Diagram

Visual construction module

Estimated presentation time: 4–5 minutes

Description topics:

1. Definition and purpose.
2. Activity-on-Node methodology.
3. Nodes and dependency arrows.
4. Parallel activities.
5. Merging activities.
6. Constructing a Network Diagram step by step.

Interactive component: Network Diagram Explorer

This should be one of the most visually impressive components.

Viewers can:

- Click any activity node.
- Inspect its duration and predecessor.
- Highlight incoming and outgoing dependencies.
- Understand why an activity cannot start.
- Toggle dependency visibility.
- Observe parallel activities.
- Highlight the critical path.

[Solved Consider the above project network diagram. Identify | Chegg.com](https://images.openai.com/static-rsc-4/lcj1gPI_VhrVE-AsrOGv-2vG09IKS-pWT2juyUD-42MKyRvJbc5ik-Wv3R4hsHKg6__6gbj9gmKXqTygz6vY0seHsb7PHzELyFIuoWqlEIZt-SSsSwltpZrIYx-RJi6ascWRjI3YYuRL_7jol-fEpGKLdjUeKcKbcAuHTvzZxKo?purpose=inline)

[chegg.com](https://www.chegg.com/homework-help/questions-and-answers/consider-project-network-diagram-identify-critical-path--abdf-b-abdef-c-acg-d-acef-e-abef--q15043481?utm_source=chatgpt.com)

Recommended advanced interaction:

Add a small simulation:

"What happens if Database Design takes 4 days instead of 3?"

The diagram should update its path highlighting and explain that the second path now becomes critical.

Member 3's objective: Teach viewers to read and understand the structure of a Network Diagram.

## Member 4 — Critical Path Method (CPM)

[PPT - Instructional Objective PowerPoint Presentation, free download - ID:7006444](https://images.openai.com/static-rsc-4/vnnIt6DtRkvBFqxchEF773mAXnS2MIFuZE9jLv0XdP8pNQPgYqw6kJ_Zly8iWisb_mDE8tfPawMYJ_isYZfy9TKxtVOnAjNRFwbMoZVHyZeAR4as5YfkUgqvst2CZZwBc_NQSzyyHCoXQwATqLvxVhjFbB3aYg-9gj4_JvIAg5E?purpose=inline)

Topic: Critical Path, Forward Pass, Backward Pass and Slack

Calculation module

Estimated presentation time: 4–5 minutes

Description topics:

1. What is the Critical Path?
2. Why is it the longest path?
3. Forward Pass.
4. Backward Pass.
5. ES, EF, LS and LF.
6. Total Float and Slack.
7. Identifying critical activities.

Interactive component: CPM Calculation Studio

This should be the most educationally interactive calculation module.

Viewers should be able to select an activity and inspect its scheduling values.

CPM Formula Explorer

Activity C

ES

# 4

EF

# 6

LS

# 5

LF

# 7

Duration

# 3

Total Float

# 1

Non-critical Activity

Illustrative calculated values using the shared six-activity schedule.

Advanced interaction: Delay Simulator

A slider allows viewers to change an activity's duration. The system recalculates the critical path, project duration and float.

The result should explain the reason for each change rather than just showing a new number.

Member 4's objective: Make CPM calculations understandable, not intimidating.

## Member 5 — Gantt Chart & Comparative Analysis

[Gantt Chart](https://images.openai.com/static-rsc-4/n4-JVlY9o_0Vsb5gRjsufm9UC9Yrec4xHdCbz_SwrkuPW2nwHQPJFwvzGrqjlfe86wUSwbaIUVDdbXAxSje_c1mQRR-AeOcy9SbSkyJTKchozXREKS9W2DLBFPVmVgsf9nne6UJSGOy6zilYln75JuOkyhfYGgxcbmzP2v_Wu1A?purpose=inline)

Topic: Gantt Chart, Scheduling and Comparison

Timeline module

Estimated presentation time: 4–5 minutes

Description topics:

1. What is a Gantt Chart?
2. Components of a Gantt Chart.
3. Activities and durations.
4. Start and finish dates.
5. Overlapping activities.
6. Progress monitoring.
7. Network Diagram vs Gantt Chart.

Interactive component: Gantt Chart Studio

Viewers can:

- Hover over or select task bars.
- Inspect duration, start and finish.
- Change task durations.
- View overlapping activities.
- Toggle the critical path.
- Observe changes in the schedule.
- Compare the Network Diagram with the Gantt Chart.

[ASP.NET Core Gantt Chart | Timeline Chart | Syncfusion](https://images.openai.com/static-rsc-4/Ea-E2TUJZX4LxHUQm7WC1gt_VIcaVjOXdKwaRemvZPI8PAunM8TKzAOl0EMU6Zz-rQaeWDHc0gEP_wyMUHTbIQXBkJtkzK9Ce4GLmaeeRU3x73ayLqwjy3JVGc2VfYeblTXg2cxaBtBeCMvr7Kz8kKVrgXueSDraIMC6p27baJo?purpose=inline)

[syncfusion.com](https://www.syncfusion.com/aspnet-core-ui-controls/gantt-chart?utm_source=chatgpt.com)

Member 5's objective: Demonstrate how logical project dependencies become a time-based schedule.

# 5. Complete user experience and navigation

The application must be a continuous, scrollable educational experience.

It must not behave like a presentation deck.

## Proposed information architecture

## Project Schedule Management

Interactive learning environment

01 — Introduction

Schedule Management & six processes

02 — Dependencies

Dependency classifications & four relationships

03 — Network Diagram

AON, nodes, arrows and parallel activities

04 — Critical Path

CPM, forward/backward pass and slack

05 — Gantt Chart

Timeline, activity bars and comparison

06 — Knowledge Check

Interactive challenges and final recap

## Navigation design

Use a professional sticky navigation bar:

- Overview
- Schedule Process
- Dependencies
- Network Diagram
- Critical Path
- Gantt Chart
- Quiz

On desktop, a compact secondary progress indicator can show the currently visible section.

On mobile, use a horizontally scrollable navigation or compact menu.

There should be no next-slide or previous-slide mechanism.

# 6. Premium UI/UX requirements

This is a major part of the project. The visual experience should be comparable to a polished professional SaaS educational product.

## 6.1 Design direction

Mandatory: Light theme

The visual direction should be:

Modern editorial + premium SaaS + interactive educational visualization.

## Light canvas

Clean content card

Subtle borders and generous whitespace.

Primary environment

## Muted accents

Use colors to communicate meaning.

### Recommended color system

| Purpose         | Color     |
| --------------- | --------- |
| Main background | `#F7F8FA` |
| Card background | `#FFFFFF` |
| Main text       | `#202938` |
| Secondary text  | `#687385` |
| Primary accent  | `#477CB8` |
| Success         | `#4D9574` |
| Warning         | `#D6A14C` |
| Critical path   | `#D66B68` |
| Borders         | `#E6E9EF` |

No dark backgrounds, neon effects, excessive gradients or colorful glassmorphism.

## 6.2 Typography

Recommended:

- Inter
- Manrope
- Plus Jakarta Sans

Use a clear typographic hierarchy:

- Large editorial headings.
- Medium section titles.
- Readable body text.
- Monospaced or tabular numbers for formulas and scheduling data.

## 6.3 Interaction design

Use:

- Smooth hover feedback.
- Subtle transitions.
- Interactive SVG diagrams.
- Expandable explanations.
- Tooltips.
- Live calculations.
- Drag-and-drop where useful.
- Animated dependency highlighting.
- Progress indicators.

Avoid:

- Full-screen transition animations.
- Slide-like content reveals.
- Excessive scrolling animations.
- Auto-playing animations.
- Decorative motion that interferes with learning.

Important: Animation should explain relationships, not merely decorate the interface.

## 6.4 Responsive design

The application must work on:

- Desktop presentations.
- Laptops.
- Tablets.
- Mobile devices.

The Network Diagram and Gantt Chart should support horizontal scrolling or responsive layouts without losing their labels and relationships.

## 6.5 Accessibility

- Keyboard-accessible controls.
- Visible focus states.
- Sufficient color contrast.
- Text labels alongside color-coded information.
- Reduced-motion support.
- Accessible SVG descriptions.

# 7. Functional requirements

| ID    | Requirement                                  | Priority |
| ----- | -------------------------------------------- | -------- |
| FR-01 | Continuous scroll-based navigation           | Must     |
| FR-02 | Five member-specific learning modules        | Must     |
| FR-03 | Interactive six-process explorer             | Must     |
| FR-04 | Dependency relationship explorer             | Must     |
| FR-05 | Interactive Network Diagram                  | Must     |
| FR-06 | Dynamic CPM calculator                       | Must     |
| FR-07 | Live critical path detection                 | Must     |
| FR-08 | Interactive Gantt Chart                      | Must     |
| FR-09 | Shared scheduling data across visualizations | Must     |
| FR-10 | Final knowledge-check quiz                   | Should   |
| FR-11 | PERT estimator                               | Should   |
| FR-12 | Reset-to-original-example functionality      | Must     |
| FR-13 | Responsive layouts                           | Must     |

## 7.1 Most important functional requirement

Non-negotiable

The Network Diagram, CPM calculator and Gantt Chart must be synchronized.

For example:

1. A viewer changes Database Design from 3 days to 5 days.
2. The Network Diagram updates its activity information.
3. CPM recalculates the paths and float.
4. The critical path is updated.
5. The Gantt Chart adjusts its schedule.
6. The viewer receives an explanation of what changed.

There must be one source of truth for project scheduling data.

# 8. Technical architecture

## Recommended technology stack

The exact stack can be adapted to the development environment, but the following is a strong starting point.

| Layer            | Recommendation                    |
| ---------------- | --------------------------------- |
| Frontend         | React + TypeScript                |
| Build system     | Vite                              |
| Styling          | Tailwind CSS + custom CSS         |
| Network Diagram  | SVG + React                       |
| Gantt Chart      | Custom SVG/HTML timeline          |
| Animation        | Framer Motion                     |
| Icons            | Lucide                            |
| State management | React Context or Zustand          |
| Calculations     | Pure TypeScript scheduling engine |
| Hosting          | Vercel / Netlify                  |

No backend is necessary for the initial version.

### Application architecture

\#chatgpt-mermaid-\_r_sp\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_sp\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_sp\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_sp\_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-\_r_sp\_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_sp\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_sp\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_sp\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_sp\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_sp\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_sp\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_sp\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_sp\_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_sp\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_sp\_ p{margin:0;}#chatgpt-mermaid-\_r_sp\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_sp\_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_sp\_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_sp\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_sp\_ .label text,#chatgpt-mermaid-\_r_sp\_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_sp\_ .node rect,#chatgpt-mermaid-\_r_sp\_ .node circle,#chatgpt-mermaid-\_r_sp\_ .node ellipse,#chatgpt-mermaid-\_r_sp\_ .node polygon,#chatgpt-mermaid-\_r_sp\_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-\_r_sp\_ .rough-node .label text,#chatgpt-mermaid-\_r_sp\_ .node .label text,#chatgpt-mermaid-\_r_sp\_ .image-shape .label,#chatgpt-mermaid-\_r_sp\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_sp\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_sp\_ .rough-node .label,#chatgpt-mermaid-\_r_sp\_ .node .label,#chatgpt-mermaid-\_r_sp\_ .image-shape .label,#chatgpt-mermaid-\_r_sp\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_sp\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_sp\_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_sp\_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_sp\_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-\_r_sp\_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-\_r_sp\_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_sp\_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_sp\_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_sp\_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-\_r_sp\_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-\_r_sp\_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_sp\_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_sp\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_sp\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_sp\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_sp\_ .icon-shape,#chatgpt-mermaid-\_r_sp\_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_sp\_ .icon-shape p,#chatgpt-mermaid-\_r_sp\_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-\_r_sp\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_sp\_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_sp\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_sp\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_sp\_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-\_r_sp\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_sp\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_sp\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_sp\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_sp\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_sp\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_sp\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_sp\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_sp\_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-\_r_sp\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_sp\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_sp\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_sp\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_sp\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_sp\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_sp\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_sp\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(153, 206, 255);}#chatgpt-mermaid-\_r_sp\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(153, 206, 255);}#chatgpt-mermaid-\_r_sp\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_sp\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_sp\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-width:1px;}#chatgpt-mermaid-\_r_sp\_ .node rect,#chatgpt-mermaid-\_r_sp\_ .node circle,#chatgpt-mermaid-\_r_sp\_ .node ellipse,#chatgpt-mermaid-\_r_sp\_ .node polygon,#chatgpt-mermaid-\_r_sp\_ .node path{fill:rgb(0, 40, 77);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_sp\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_sp\_ .mermaid-decision .label-container{fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_sp\_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_sp\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_sp\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Shared Project DatasetSchedule Calculation EngineDependency GraphCPM EngineGantt Timeline EngineInteractive Network DiagramCPM Calculation StudioInteractive Gantt ChartShared Application StateLive Explanation and Feedback

### Calculation engine responsibilities

The calculation engine must:

- Validate activity IDs.
- Validate predecessor references.
- Detect circular dependencies.
- Perform topological sorting.
- Calculate early start and early finish.
- Perform backward pass.
- Calculate late start and late finish.
- Calculate total float.
- Detect one or multiple critical paths.
- Calculate project duration.
- Recalculate everything when inputs change.

Do not hardcode the answers for A–F. The example values should be generated by the engine.

# 9. Presentation and teaching strategy

Although the website is interactive, the team still needs a coordinated speaking structure.

I recommend a total duration of approximately 20–23 minutes.

| Member | Module                         | Time    |
| ------ | ------------------------------ | ------- |
| 1      | Project Schedule Management    | 3–4 min |
| 2      | Dependencies and Relationships | 3–4 min |
| 3      | Network Diagram                | 4–5 min |
| 4      | CPM and Critical Path          | 4–5 min |
| 5      | Gantt Chart and Comparison     | 4–5 min |
| All    | Final quiz and recap           | 2 min   |

### Speaking approach

Each member should follow this pattern:

1. Explain the concept in simple language.
2. Show the relevant visual.
3. Invite the audience to interact.
4. Demonstrate a practical example.
5. Explain the result.

The audience should be treated as participants, not passive viewers.

# 10. Quality assurance and acceptance criteria

The project is not complete simply because the website looks attractive.

It must pass the following tests.

## Academic accuracy

- All six schedule management processes are correct.
- Dependency classifications are distinguished from relationship types.
- FS, SS, FF and SF are correctly explained.
- AON nodes and arrows are correctly represented.
- CPM calculations are generated dynamically.
- The initial critical path is A–B–D–E–F.
- Initial project duration is 18 workdays.
- Initial total float for C is one day.
- The initial Gantt Chart follows the dependencies.
- PERT uses the correct weighted-average formula.

## Interactivity

- Every member has an actual interactive feature.
- The Network Diagram is clickable.
- Activity durations can be changed.
- CPM values update automatically.
- Critical paths update automatically.
- Gantt bars update automatically.
- The reset button restores the original example.
- The quiz provides explanations for answers.

## Design

- Light theme throughout.
- No slideshow interface.
- No unnecessary dark sections.
- No generic AI-generated dashboard appearance.
- Professional typography.
- Consistent spacing.
- Smooth but restrained interactions.
- Fully responsive.

## Technical

- No broken interactions.
- No circular dependency crashes.
- No inconsistent scheduling calculations.
- No console errors.
- No horizontal overflow on mobile except intentional chart scrolling.
- Accessible controls and focus states.

# 11. Research references

These are useful references for the academic content and implementation decisions.

1\. Project Management Institute — Critical Path Method Calculations

&#x20;  [Understanding the Basics of CPM Calculations](https://www.pmi.org/learning/library/critical-path-method-calculations-scheduling-8040?utm_source=chatgpt.com).

2\. Project Management Institute — Project Estimation and PERT

&#x20;  [Leveraging the New Practice Standard for Project Estimating](https://www.pmi.org/learning/library/leveraging-new-practice-standard-project-estimating-6222?utm_source=chatgpt.com).

3\. Project Management Institute — Scheduling Best Practices

&#x20;  [Scheduling 101: The Basic of Best Practices](https://www.pmi.org/learning/library/schedule-101-basic-best-practices-6701?utm_source=chatgpt.com).

4\. Microsoft Support — Gantt Chart

&#x20;  [Work with the Gantt Chart View](https://support.microsoft.com/en-gb/project/work-with-the-gantt-chart-view?utm_source=chatgpt.com).

5\. Microsoft Support — Critical Path

&#x20;  [Manage Your Project's Critical Path](https://support.microsoft.com/en-us/project/manage-your-project-s-critical-path?utm_source=chatgpt.com).

6\. Microsoft Support — Task Dependencies

&#x20;  [Link Tasks in a Project](https://support.microsoft.com/en-US/project/link-tasks-in-a-project?utm_source=chatgpt.com).

7\. Microsoft Excel — Gantt Chart Concepts

&#x20;  [Gantt Charts and Project Scheduling](https://excel.cloud.microsoft/create/en/gantt-charts/?utm_source=chatgpt.com).

Primary textbook: Kathy Schwalbe, Information Technology Project Management, 9th Edition, Chapter 6: Project Schedule Management.

# 12. Final product definition

The finished product should be:

# Project Schedule Management

## Understand the logic. Visualize the timeline. Master the schedule.

[PERT Chart (JointJS) & Gantt Chart (Bryntum) – Demo applications & examples](https://images.openai.com/static-rsc-4/5JXQx7n-OuXfE32R0auEBFh7ZTy0Ou8fUz0IOf9jEe8s_h4N3t82iHr_70vFEFpqJOWS_3k6LPX2ARucnrFx1YoVa3U8eUmPQicwWjKU3DX7SMz9ZLr69s60OQPnS76c6u2JWdnuvT81qACWNsO4LHwSBx3reHlvdADlUNjDNQk?purpose=inline)

[jointjs.com](https://www.jointjs.com/demos/bryntum-integration?utm_source=chatgpt.com)

# 05

Team learning modules

# 06

Learning sections

# 03

Core interactive scheduling tools

# 01

Connected learning experience

The defining experience

A viewer changes one task's duration and watches the Network Diagram, critical path calculations, and Gantt Chart respond together.

That is the feature that will make this project memorable.





