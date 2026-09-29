"""Theory + module quizzes: UI/UX Design Fundamentals."""

LESSONS = {
"Design Principles": """# Design Principles

## UI vs UX
**User Experience (UX)** is how the whole journey feels: is it useful, easy and pleasant? **User Interface (UI)** is the visual and interactive layer people touch. Good UI without good UX is a pretty product nobody can use.

## Core visual principles
- **Hierarchy**: size, weight, colour and position tell users what matters most.
- **Contrast**: differences in colour, size or weight create emphasis and readability.
- **Alignment**: aligning elements to a grid creates order.
- **Proximity**: related items sit close together; unrelated ones are separated.
- **Repetition/Consistency**: the same pattern always means the same thing.
- **White space**: breathing room improves comprehension; it is not wasted space.

## Gestalt laws
People perceive groups before individual parts: **proximity**, **similarity**, **closure** and **continuity** explain why layouts feel organised.

## Nielsen's usability heuristics (selection)
1. Visibility of system status
2. Match between the system and the real world
3. User control and freedom (undo, cancel)
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Aesthetic and minimalist design

## Laws worth knowing
- **Hick's Law**: more choices, slower decisions.
- **Fitts's Law**: large, close targets are easier to hit.
- **Jakob's Law**: users expect your site to work like others they know.

> **Key takeaway:** design is problem solving. Principles give you a shared vocabulary to justify decisions.""",

"User Research Methods": """# User Research Methods

## Why research?
Designers are not the users. Research replaces assumptions with evidence and reduces expensive rework.

## Qualitative vs quantitative
- **Qualitative** methods explain *why* (interviews, observation, usability tests).
- **Quantitative** methods measure *how many* (surveys, analytics, A/B tests).

## Common methods
| Method | Best for |
|---|---|
| User interviews | Motivations, pain points, context |
| Surveys | Measuring attitudes at scale |
| Contextual inquiry | Watching people in their real environment |
| Card sorting | Designing navigation and information architecture |
| Diary studies | Behaviour over time |
| Analytics review | What users actually do |

## Running a good interview
- Ask open questions: "Tell me about the last time you..."
- Avoid leading questions ("Don't you think this is confusing?").
- Listen more than you talk; follow up with "Why?".
- Interview 5 to 8 participants per segment to find the main patterns.

## Making sense of it
- **Affinity mapping** groups observations into themes.
- **Personas** are research-based archetypes, not invented characters.
- **Journey maps** show steps, emotions and pain points over time.

## Ethics
Obtain consent, protect privacy and explain how data will be used.

> **Key takeaway:** what people say and what they do differ; combine methods to get the full picture.""",

"Problem Definition": """# Problem Definition

## Design thinking stages
**Empathise → Define → Ideate → Prototype → Test.** This lesson covers *Define*, the step that turns research into a clear problem.

## Why it matters
A brilliant solution to the wrong problem is a failure. A sharp problem statement focuses the team and gives you a way to judge ideas.

## Point-of-view statement
> **[User]** needs **[need]** because **[insight]**.

Example: *Working parents need a way to resume lessons in short sessions because their study time is fragmented.*

## How Might We (HMW) questions
Turn problems into opportunities: "How might we let learners resume in under 10 seconds?" Good HMWs are neither too broad ("How might we improve education?") nor too narrow (they should not imply a solution).

## Prioritising
- **Impact vs effort matrix**: do high-impact, low-effort items first.
- **MoSCoW**: Must, Should, Could, Won't.

## Success metrics
Decide how you will know it worked: task completion rate, time on task, error rate, satisfaction (SUS or NPS).

## Constraints and scope
List technical, legal and budget constraints early so ideas stay realistic.

> **Key takeaway:** define the problem in terms of user needs and measurable outcomes, not features.""",

"Typography Fundamentals": """# Typography Fundamentals

## Why typography matters
Most interfaces are text. Good typography makes content readable, sets tone and creates hierarchy.

## Vocabulary
- **Typeface** (family) vs **font** (a specific weight/size).
- **Serif** faces have small strokes on letters; **sans-serif** faces do not.
- **Weight**, **size**, **line height (leading)**, **letter spacing (tracking)**.

## Readability guidelines
- Body text: **16px or larger** on screens.
- Line length: about **45 to 75 characters**.
- Line height: about **1.4 to 1.6** for body text.
- Left-align body text; avoid long stretches of all-caps or centred text.
- Use no more than **two typefaces**.

## Building a type scale
Pick a base size and scale by a ratio (for example 1.25): 16, 20, 25, 31, 39. Consistent steps make hierarchy predictable.

```css
:root { --step-0: 1rem; --step-1: 1.25rem; --step-2: 1.563rem; }
h2 { font-size: var(--step-2); line-height: 1.2; }
p  { font-size: var(--step-0); line-height: 1.6; }
```

## Hierarchy through type
Vary size, weight and colour, but do it consistently: headings, subheadings, body, captions.

## Accessibility
Ensure sufficient contrast, allow text to resize, and avoid very thin weights at small sizes.

> **Key takeaway:** readable text is the foundation of usable design: size, spacing and consistency beat decoration.""",

"Color Theory and Application": """# Color Theory and Application

## The colour wheel
- **Primary, secondary, tertiary** colours.
- **Hue** (the colour), **saturation** (intensity), **lightness/value** (light vs dark).

## Harmonies
| Scheme | Description |
|---|---|
| Monochromatic | One hue, varied lightness |
| Analogous | Neighbouring hues |
| Complementary | Opposite hues (high contrast) |
| Triadic | Three evenly spaced hues |

## The 60-30-10 rule
About 60% dominant neutral, 30% secondary colour, 10% accent for calls to action.

## Meaning and culture
Colours carry associations (red for danger or urgency, green for success), but meanings vary across cultures. Never rely on colour alone to convey information: add icons or text.

## Accessible contrast (WCAG 2.1)
- **AA**: at least **4.5:1** for normal text, **3:1** for large text and UI components.
- **AAA**: 7:1 for normal text.
Check with a contrast checker before finalising palettes.

## Building a UI palette
1. Brand/primary colour with tints and shades.
2. Neutral greys for text and backgrounds.
3. Semantic colours: success, warning, error, info.
4. Define both light and dark themes using tokens (`--color-primary`, `--color-surface`).

## Colour blindness
About 1 in 12 men have some colour vision deficiency. Avoid red/green as the only signal.

> **Key takeaway:** choose a restrained palette, test contrast, and never use colour as the only carrier of meaning.""",

"Layout and Composition": """# Layout and Composition

## Grids
A grid creates alignment and rhythm. Web layouts commonly use **12 columns** with consistent gutters and margins, adapting to fewer columns on smaller screens.

## Spacing system
Use a base unit (usually **8px**) and multiples: 8, 16, 24, 32, 48. Consistent spacing feels intentional and speeds up design decisions.

## Visual hierarchy and reading patterns
- **F-pattern**: users scan text-heavy pages across the top, then down the left side.
- **Z-pattern**: simple pages are scanned from top-left to top-right, diagonally, then across the bottom.
Place important content and primary actions along these paths.

## Responsive design
Design **mobile-first** and scale up. Define breakpoints where the content needs them (for example 640, 768, 1024, 1280 px), not for specific devices.

## Composition techniques
- **Rule of thirds** for image placement.
- **Focal point**: one clear primary element per screen.
- **Balance**: symmetrical (formal) or asymmetrical (dynamic).
- **Grouping** with cards, dividers or background tints.

## Touch and pointer targets
Make tap targets at least **44×44 px** (Apple) or **48×48 dp** (Material) with adequate spacing.

## Common mistakes
Cramped spacing, too many competing focal points, inconsistent alignment and text running the full width of a wide screen.

> **Key takeaway:** a grid, a spacing scale and a clear focal point solve most layout problems.""",

"Wireframing Basics": """# Wireframing Basics

## What a wireframe is
A wireframe is a simplified, **low-fidelity** blueprint of a screen showing structure, content placement and functionality, without colours, imagery or final typography.

## Why start low-fidelity?
- Cheap and fast to change.
- Focuses feedback on structure and flow, not aesthetics.
- Prevents stakeholders from arguing about colours too early.

## What to include
- Layout of major regions (header, navigation, content, footer).
- Real or realistic **content** rather than "lorem ipsum" where possible.
- Interactive elements: buttons, forms, links.
- Annotations explaining behaviour.

## Process
1. **Sketch** several ideas on paper (the "crazy 8s" exercise: 8 ideas in 8 minutes).
2. Pick the strongest and build a **digital wireframe** in Figma or similar.
3. Connect screens into a **user flow**.
4. Test with users and iterate.

## User flows and information architecture
A **user flow** maps the steps a user takes to complete a task, including decisions and errors. **Information architecture** organises content so people can find it (navigation labels, groupings).

## Tools
Paper, Figma, Balsamiq, Whimsical, Miro.

> **Key takeaway:** solve structure first. If it does not work in grey boxes, decoration will not fix it.""",

"High-Fidelity Prototyping": """# High-Fidelity Prototyping

## Wireframe vs prototype
A **wireframe** shows structure. A **high-fidelity prototype** looks and behaves like the finished product: real typography, colour, imagery and interactions, but usually without a working back end.

## When to build one
After the structure is validated. High-fidelity prototypes are used for usability testing, stakeholder sign-off and as a specification for developers.

## Building blocks in Figma-style tools
- **Frames** for screens; **auto layout** for responsive spacing.
- **Components** and **variants** for reusable elements (button: primary, secondary, disabled).
- **Styles/variables** for colours and text so changes propagate everywhere.
- **Interactions**: click, hover and transitions between frames.

## Micro-interactions
Small feedback moments (a button press, a loading indicator, a success check) communicate system status. Keep them short (about 150 to 300 ms) and purposeful.

## Test before you build
Use the prototype to test tasks with 5 users. Fixing a problem here costs a fraction of fixing it in code.

## Developer hand-off
Provide specs (spacing, tokens, states), exported assets and notes about edge cases: empty, loading, error and long-text states.

> **Key takeaway:** a prototype is a question you ask users, not a finished answer.""",

"Design Systems": """# Design Systems

## What is a design system?
A design system is a shared source of truth: **design tokens, reusable components, patterns and guidelines** that keep products consistent and speed up teamwork.

## Why teams adopt them
- Consistency across products and teams.
- Faster design and development (reuse instead of rebuild).
- Better accessibility (fix once, fixed everywhere).
- Clear communication between designers and developers.

## Layers
1. **Tokens**: named values for colour, spacing, typography, radius, shadow (`color.primary.500`, `space.4`).
2. **Components**: buttons, inputs, cards, modals with defined states.
3. **Patterns**: forms, navigation, empty states.
4. **Guidelines**: voice and tone, accessibility rules, do and don't.

## Atomic design
Build from **atoms** (button) to **molecules** (search field + button) to **organisms** (header) to **templates** and **pages**.

## Documenting a component
Purpose, anatomy, variants, states (default, hover, focus, disabled, error), accessibility notes, and code snippets.

## Governance
Someone must own the system: define contribution rules, versioning and deprecation, and measure adoption.

## Examples
Material Design, Apple Human Interface Guidelines, IBM Carbon, Atlassian Design System.

> **Key takeaway:** a design system scales good decisions: tokens and components make the right thing the easy thing.""",

"Usability Testing Methods": """# Usability Testing Methods

## Purpose
Usability testing observes real people attempting realistic tasks to find where the design fails them.

## Types
| Type | Description |
|---|---|
| Moderated | A facilitator guides and probes (in person or remote) |
| Unmoderated | Participants complete tasks alone; recorded for later analysis |
| Guerrilla | Quick tests with people in public spaces |
| A/B test | Compares two versions using live traffic |
| First-click test | Measures whether users start in the right place |

## The think-aloud protocol
Participants narrate their thoughts while working. The facilitator stays neutral and does not help.

## Planning a test
1. Set **goals** and questions.
2. Write **task scenarios** ("You want to resume yesterday's course. Show me how.") without giving away UI labels.
3. Recruit **representative users**.
4. Run a **pilot** session.
5. Test with about **5 users** per round to uncover most major issues, then iterate.

## Metrics
- **Task success rate**
- **Time on task**
- **Error count**
- **Satisfaction**: System Usability Scale (SUS), scored 0 to 100 (68 is the average benchmark).

## Reporting
Rate issues by **severity** (critical, major, minor), include evidence (clips, quotes) and recommend fixes.

> **Key takeaway:** watch what people do, not just what they say. Frequent small tests beat one big test.""",

"Accessibility Standards": """# Accessibility Standards

## Why accessibility?
Around 1 in 6 people live with a disability. Accessible design also helps people in bright sunlight, with a broken arm, or on a slow connection. It is often a **legal requirement** too.

## WCAG and the POUR principles
The Web Content Accessibility Guidelines (WCAG 2.1) are organised as:
- **Perceivable**: information can be perceived (text alternatives, captions, contrast).
- **Operable**: usable by keyboard, enough time, no seizure-inducing content.
- **Understandable**: readable, predictable, helps avoid and correct mistakes.
- **Robust**: works with assistive technologies.

Levels: **A** (minimum), **AA** (the common target), **AAA** (highest).

## Practical checklist
- Colour contrast at least **4.5:1** for normal text.
- Every image has meaningful `alt` text (empty `alt=""` for decorative images).
- All functionality works with the **keyboard**; focus is always visible.
- Use semantic HTML and labels for form fields.
- Provide captions and transcripts for media.
- Do not rely on colour alone.

## ARIA
Use native HTML first. Add ARIA (`aria-label`, `role`, `aria-live`) only when native elements cannot express the behaviour.

## Testing
Automated tools (axe, Lighthouse) catch only part of the problems. Also test with keyboard only and with a screen reader (NVDA, VoiceOver).

> **Key takeaway:** design inclusively from the start; retrofitting accessibility is far more expensive.""",

"Iterative Design": """# Iterative Design

## The cycle
**Design → Prototype → Test → Analyse → Refine → repeat.** Each loop reduces uncertainty and improves the product.

## Why iterate?
First ideas are rarely the best. Small, frequent improvements informed by evidence beat one big launch based on assumptions.

## Turning feedback into action
1. Collect findings from tests, analytics and support tickets.
2. Group them into themes.
3. Prioritise by **severity, frequency and effort**.
4. Change one thing (or a few) at a time so you know what worked.
5. Re-test.

## A/B testing
Show version A and B to comparable users and measure a goal metric (sign-ups, clicks). Ensure enough traffic for statistical significance and test a single change.

## Measuring improvement
Track the same metrics each round: task success, time, errors, SUS, conversion.

## Agile and Lean UX
Work in short cycles, share work early, collaborate with developers and product owners, and treat designs as hypotheses to be validated.

## Knowing when to stop
Stop iterating when the metrics meet the goals or when further gains no longer justify the cost, then keep monitoring after launch.

> **Key takeaway:** design is never "done"; it improves through repeated, evidence-based cycles.""",
}

QUIZZES = {
"Design Thinking": [
 ("Which is the correct order of the design thinking stages?", "Define, Empathise, Test, Prototype, Ideate", "Empathise, Define, Ideate, Prototype, Test", "Prototype, Test, Empathise, Define, Ideate", "Ideate, Test, Define, Empathise, Prototype", "b"),
 ("Hick's Law states that...", "Larger targets are easier to hit", "More choices increase decision time", "Users read in an F-pattern", "Users expect consistency with other sites", "b"),
 ("Which question is a good 'How Might We' statement?", "How might we add a chatbot?", "How might we improve everything?", "How might we let learners resume a lesson in under 10 seconds?", "How might we make the logo bigger?", "c"),
 ("Qualitative research mainly answers...", "How many?", "Why?", "How much revenue?", "Which server is fastest?", "b"),
 ("Roughly how many participants often reveal most major usability issues per round?", "1", "5", "50", "500", "b"),
],
"Visual Design": [
 ("What is the recommended body text line length?", "10-20 characters", "45-75 characters", "120-160 characters", "200+ characters", "b"),
 ("Under WCAG 2.1 AA, the minimum contrast ratio for normal text is...", "2:1", "3:1", "4.5:1", "10:1", "c"),
 ("A common base unit for spacing systems is...", "3px", "8px", "13px", "27px", "b"),
 ("Why should colour not be the only way to convey meaning?", "It costs more", "Some users cannot distinguish certain colours", "Browsers block colour", "Printers ignore colour", "b"),
 ("Which is a recommended minimum touch target size?", "10x10 px", "24x24 px", "44x44 px", "12x12 px", "c"),
],
"Prototyping": [
 ("A low-fidelity wireframe is mainly used to validate...", "Final colours", "Structure and flow", "Animations", "Photography", "b"),
 ("What is a design token?", "A login credential", "A named, reusable design value such as a colour or spacing", "A prototype screen", "A user persona", "b"),
 ("Why test a prototype before development?", "Fixing issues is cheaper before code is written", "Developers dislike prototypes", "It replaces the need for requirements", "It removes accessibility needs", "a"),
 ("In atomic design, a search field combined with a button is a...", "Atom", "Molecule", "Organism", "Template", "b"),
 ("Which states should a component's documentation include?", "Only the default state", "Default, hover, focus, disabled and error", "Only error", "Only mobile", "b"),
],
"Usability": [
 ("The think-aloud protocol asks participants to...", "Stay silent", "Narrate their thoughts while performing tasks", "Read the code", "Rate colours", "b"),
 ("The 'P' in POUR stands for...", "Practical", "Perceivable", "Persistent", "Private", "b"),
 ("Which SUS score is commonly cited as the average benchmark?", "25", "50", "68", "100", "c"),
 ("What should you do when testing a design change with an A/B test?", "Change many things at once", "Test a single change on comparable users", "Show it to only one person", "Skip measuring", "b"),
 ("Automated accessibility tools such as Lighthouse...", "Find every accessibility issue", "Catch only part of the issues, so manual testing is still needed", "Replace screen readers", "Are illegal to use", "b"),
],
}
