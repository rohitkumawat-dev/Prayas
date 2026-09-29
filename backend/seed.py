from app import create_app, db
from app.models.user import User
from app.models.course import Course
from app.models.module import Module
from app.models.lesson import Lesson
from app.models.quiz import Quiz, Question
from app.models.enrollment import Enrollment
from app.models.lesson_progress import LessonProgress
from app.models.quiz_attempt import QuizAttempt, QuizAnswer
from app.models.certificate import Certificate
from app.models.activity import Activity
from werkzeug.security import generate_password_hash
from datetime import datetime, timezone, timedelta
import uuid
import random

app = create_app()

LESSON_CONTENTS = {
    'web_intro': """# Introduction to Web Development

Web development is the work involved in developing a website for the Internet or an intranet. It can range from developing a simple single static page to complex web applications.

## The Web Development Landscape

The web has evolved dramatically since Tim Berners-Lee created the first website in 1991. Today, web development encompasses:

- **Frontend Development**: Creating the user interface and experience
- **Backend Development**: Server-side logic, databases, and APIs
- **Full-Stack Development**: Combining both frontend and backend skills

## Key Technologies

### HTML (HyperText Markup Language)
HTML provides the structure of a webpage. It uses elements and tags to define content like headings, paragraphs, links, and images.

### CSS (Cascading Style Sheets)
CSS controls the visual presentation of HTML elements. It handles layout, colors, fonts, and responsive design.

### JavaScript
JavaScript adds interactivity and dynamic behavior to web pages. It's the only programming language that runs natively in browsers.

## Development Tools

Every web developer needs:
1. A code editor (VS Code, Sublime Text)
2. Browser Developer Tools
3. Version control (Git)
4. A terminal/command line

## Summary

Understanding these fundamentals is essential before diving deeper into specific frameworks and libraries.""",

    'html_basics': """# HTML Fundamentals

HTML (HyperText Markup Language) is the standard markup language for creating web pages.

## Document Structure

Every HTML document follows this basic structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is a paragraph.</p>
</body>
</html>
```

## Essential Elements

### Headings
HTML provides six levels of headings, from `<h1>` (most important) to `<h6>` (least important).

### Paragraphs and Text
- `<p>` for paragraphs
- `<strong>` for bold/important text
- `<em>` for emphasized text
- `<br>` for line breaks

### Links and Images
```html
<a href="https://example.com">Visit Example</a>
<img src="photo.jpg" alt="Description of the photo">
```

### Lists
- Ordered lists: `<ol>` with `<li>` items
- Unordered lists: `<ul>` with `<li>` items

## Semantic HTML

Modern HTML emphasizes semantic elements that describe their content:
- `<header>`, `<footer>`, `<nav>`, `<main>`
- `<article>`, `<section>`, `<aside>`
- `<figure>`, `<figcaption>`

Using semantic HTML improves accessibility and SEO.""",

    'css_basics': """# CSS Fundamentals

CSS (Cascading Style Sheets) is used to style and layout web pages.

## Selectors

CSS selectors target HTML elements for styling:

```css
/* Element selector */
p { color: blue; }

/* Class selector */
.highlight { background: yellow; }

/* ID selector */
#main-title { font-size: 2rem; }

/* Descendant selector */
.card p { margin: 0; }
```

## The Box Model

Every HTML element is a box with:
- **Content**: The actual content
- **Padding**: Space between content and border
- **Border**: The border around the padding
- **Margin**: Space outside the border

## Flexbox Layout

Flexbox is a one-dimensional layout method:

```css
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
}
```

## CSS Grid

Grid is a two-dimensional layout system:

```css
.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
}
```

## Responsive Design

Media queries allow different styles at different screen sizes:

```css
@media (max-width: 768px) {
    .grid {
        grid-template-columns: 1fr;
    }
}
```""",

    'js_basics': """# JavaScript Fundamentals

JavaScript is the programming language of the web.

## Variables

```javascript
// Modern variable declarations
const name = 'Alice';  // Cannot be reassigned
let age = 25;           // Can be reassigned
```

## Data Types

JavaScript has several primitive types:
- `string` - Text values
- `number` - Numeric values (integers and decimals)
- `boolean` - true or false
- `null` - Intentional absence of value
- `undefined` - Variable declared but not assigned

## Functions

```javascript
// Function declaration
function greet(name) {
    return `Hello, ${name}!`;
}

// Arrow function
const add = (a, b) => a + b;
```

## Arrays and Objects

```javascript
// Array
const fruits = ['apple', 'banana', 'cherry'];
fruits.map(f => f.toUpperCase());

// Object
const person = {
    name: 'Alice',
    age: 25,
    greet() {
        return `Hi, I'm ${this.name}`;
    }
};
```

## Async/Await

```javascript
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch:', error);
    }
}
```""",

    'python_intro': """# Introduction to Python

Python is a versatile, high-level programming language known for its readability and simplicity.

## Why Python for Data Science?

Python has become the dominant language in data science because of:

1. **Rich ecosystem**: NumPy, Pandas, Matplotlib, Scikit-learn
2. **Readable syntax**: Easy to learn and write
3. **Community support**: Vast resources and libraries
4. **Versatility**: From scripting to machine learning

## Basic Syntax

```python
# Variables
name = "Data Scientist"
years_exp = 3
skills = ["Python", "SQL", "Statistics"]

# Functions
def analyze_data(dataset, method="mean"):
    if method == "mean":
        return sum(dataset) / len(dataset)
    elif method == "median":
        sorted_data = sorted(dataset)
        n = len(sorted_data)
        mid = n // 2
        return sorted_data[mid]

# List comprehension
squares = [x**2 for x in range(10)]
```

## Data Structures

Python provides powerful built-in data structures:
- **Lists**: Ordered, mutable sequences
- **Dictionaries**: Key-value pairs
- **Sets**: Unordered unique elements
- **Tuples**: Ordered, immutable sequences""",

    'design_principles': """# Design Principles

Good design is not just about aesthetics — it's about solving problems effectively.

## Core Principles

### 1. Visual Hierarchy
Guide the user's eye through content in order of importance. Use size, color, contrast, and spacing to create clear hierarchy.

### 2. Consistency
Maintain consistent patterns throughout your design:
- Same colors for same types of actions
- Consistent spacing and typography
- Uniform component styles

### 3. Proximity
Related items should be grouped together. This principle helps users understand relationships between elements.

### 4. Contrast
Use contrast to make important elements stand out. This applies to:
- Color contrast for readability
- Size contrast for hierarchy
- Style contrast for emphasis

### 5. Whitespace
Don't fear empty space. Whitespace:
- Improves readability
- Creates visual breathing room
- Focuses attention on content

## Typography

Typography is arguably the most important design element:
- Limit to 2-3 typefaces
- Establish a clear type scale
- Ensure sufficient line height (1.5-1.8 for body text)
- Maintain adequate contrast ratios

## Color Theory

A good color palette typically includes:
- A primary brand color
- A secondary/accent color
- Neutral tones for backgrounds and text
- Semantic colors for success, warning, and error states""",

    'react_intro': """# Getting Started with React

React is a JavaScript library for building user interfaces, developed by Facebook.

## Why React?

- **Component-based**: Build encapsulated components that manage their own state
- **Declarative**: Design simple views for each state of your application
- **Virtual DOM**: Efficient updates and rendering

## Components

```tsx
// Functional component
function Welcome({ name }: { name: string }) {
    return <h1>Hello, {name}!</h1>;
}

// Usage
<Welcome name="Alice" />
```

## State Management

```tsx
import { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div>
    );
}
```

## Effects

```tsx
import { useEffect, useState } from 'react';

function UserProfile({ userId }: { userId: number }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch(`/api/users/${userId}`)
            .then(res => res.json())
            .then(data => setUser(data));
    }, [userId]);

    if (!user) return <p>Loading...</p>;
    return <h1>{user.name}</h1>;
}
```""",
}

from content import LESSON_THEORY  # full theory for every lesson (backend/content/)


def get_content(key):
    return LESSON_CONTENTS.get(key, f"""# Lesson Content

This lesson covers important concepts in the field. Study the material carefully and practice the exercises.

## Key Concepts

- Understanding the fundamentals
- Applying theory to practice
- Building real-world skills

## Practice

Try implementing the concepts discussed in this lesson in your own projects. Practice is essential for mastery.

## Summary

Review the key takeaways and prepare for the assessment.""")


def seed_db():
    with app.app_context():
        db.drop_all()
        db.create_all()

        print("Creating users...")
        siddharth = User(name='Siddharth Paradhi', email='paradhisiddharth@gmail.com',
                         password_hash=generate_password_hash('190925'), role='admin',
                         is_super_admin=True, status='active',
                         bio='Primary Super Administrator for Capacity Connect.')

        admin = User(name='Platform Admin', email='admin@capacityconnect.com',
                     password_hash=generate_password_hash('Admin@123'), role='admin',
                     is_super_admin=False, status='active',
                     bio='Platform administrator for Capacity Connect.')

        ananya = User(name='Ananya Iyer', email='ananya.iyer@example.com',
                     password_hash=generate_password_hash('Trainer@123'), role='trainer',
                     status='active',
                     bio='Senior web developer with 8 years of experience in full-stack development.')
        rohan = User(name='Rohan Mehta', email='rohan.mehta@example.com',
                      password_hash=generate_password_hash('Trainer@123'), role='trainer',
                      status='active',
                      bio='Data scientist and Python instructor with expertise in ML and analytics.')
        priya = User(name='Priya Sharma', email='priya.sharma@example.com',
                     password_hash=generate_password_hash('Trainer@123'), role='trainer',
                     status='active',
                     bio='UI/UX designer specializing in user-centered design and accessibility.')

        arjun = User(name='Arjun Nair', email='arjun.nair@example.com',
                    password_hash=generate_password_hash('Trainee@123'), role='trainee',
                    status='active',
                    bio='Aspiring full-stack developer.')
        kavya = User(name='Kavya Reddy', email='kavya.reddy@example.com',
                    password_hash=generate_password_hash('Trainee@123'), role='trainee',
                    status='active',
                    bio='Career switcher moving into data science.')
        raj = User(name='Raj Patel', email='raj.patel@example.com',
                   password_hash=generate_password_hash('Trainee@123'), role='trainee',
                   status='active',
                   bio='Computer science student.')
        neha = User(name='Neha Gupta', email='neha.gupta@example.com',
                    password_hash=generate_password_hash('Trainee@123'), role='trainee',
                    status='active',
                    bio='Graphic designer learning web development.')
        vikram = User(name='Vikram Singh', email='vikram.singh@example.com',
                     password_hash=generate_password_hash('Trainee@123'), role='trainee',
                     status='active',
                     bio='Junior developer expanding skills.')

        db.session.add_all([siddharth, admin, ananya, rohan, priya, arjun, kavya, raj, neha, vikram])
        db.session.commit()

        print("Creating courses...")
        courses_data = [
            {
                'title': 'Full-Stack Web Development',
                'thumbnail': '/course-thumbnails/full-stack-web.jpg',
                'description': 'A comprehensive course covering HTML, CSS, JavaScript, React, Node.js, and databases. Learn to build complete web applications from frontend to backend.',
                'category': 'Development',
                'difficulty': 'advanced',
                'duration_hours': 40,
                'trainer': ananya,
                'modules': [
                    {
                        'title': 'Web Fundamentals',
                        'description': 'HTML, CSS, and the basics of the web',
                        'lessons': [
                            ('Introduction to Web Development', 'web_intro', 15),
                            ('HTML Document Structure', 'html_basics', 20),
                            ('CSS Styling Basics', 'css_basics', 25),
                        ]
                    },
                    {
                        'title': 'JavaScript Essentials',
                        'description': 'Core JavaScript concepts and modern ES6+',
                        'lessons': [
                            ('JavaScript Fundamentals', 'js_basics', 30),
                            ('DOM Manipulation', None, 20),
                            ('Async JavaScript', None, 25),
                        ]
                    },
                    {
                        'title': 'React Development',
                        'description': 'Building UIs with React',
                        'lessons': [
                            ('Getting Started with React', 'react_intro', 25),
                            ('React State and Props', None, 20),
                            ('React Hooks Deep Dive', None, 30),
                        ]
                    },
                    {
                        'title': 'Backend with Node.js',
                        'description': 'Server-side development with Node.js and Express',
                        'lessons': [
                            ('Node.js Fundamentals', None, 20),
                            ('Express REST APIs', None, 25),
                            ('Database Integration', None, 30),
                        ]
                    },
                    {
                        'title': 'Deployment & DevOps',
                        'description': 'Getting your application live',
                        'lessons': [
                            ('Version Control with Git', None, 15),
                            ('CI/CD Pipelines', None, 20),
                            ('Cloud Deployment', None, 25),
                        ]
                    },
                ],
                'quiz_questions': [
                    ('What does HTML stand for?', 'HyperText Markup Language', 'High Tech Modern Language', 'Hyper Transfer Main Language', 'Home Tool Markup Language', 'a'),
                    ('Which CSS property is used for layout with rows and columns?', 'display: grid', 'display: flex', 'display: block', 'display: table', 'a'),
                    ('What keyword declares a constant in JavaScript?', 'const', 'var', 'let', 'static', 'a'),
                    ('What hook manages state in React functional components?', 'useState', 'useEffect', 'useReducer', 'useContext', 'a'),
                    ('Which HTTP method is used to create a new resource?', 'POST', 'GET', 'PUT', 'DELETE', 'a'),
                    ('What does REST stand for?', 'Representational State Transfer', 'Remote Execution Standard Technology', 'Reactive Server Template', 'Resource Exchange Service Tool', 'a'),
                    ('Which tool is commonly used for version control?', 'Git', 'NPM', 'Docker', 'Webpack', 'a'),
                ]
            },
            {
                'title': 'Python for Data Science',
                'thumbnail': '/course-thumbnails/python-data-science.jpg',
                'description': 'Master Python programming for data analysis, visualization, and machine learning. Covers NumPy, Pandas, Matplotlib, and Scikit-learn.',
                'category': 'Data Science',
                'difficulty': 'intermediate',
                'duration_hours': 30,
                'trainer': rohan,
                'modules': [
                    {
                        'title': 'Python Foundations',
                        'description': 'Core Python for data science',
                        'lessons': [
                            ('Introduction to Python', 'python_intro', 20),
                            ('Data Types and Structures', None, 25),
                            ('Control Flow and Functions', None, 20),
                        ]
                    },
                    {
                        'title': 'Data Manipulation with Pandas',
                        'description': 'Working with tabular data',
                        'lessons': [
                            ('Introduction to Pandas', None, 25),
                            ('Data Cleaning Techniques', None, 30),
                            ('Grouping and Aggregation', None, 25),
                        ]
                    },
                    {
                        'title': 'Data Visualization',
                        'description': 'Creating meaningful visualizations',
                        'lessons': [
                            ('Matplotlib Basics', None, 20),
                            ('Seaborn for Statistical Plots', None, 25),
                            ('Interactive Visualizations', None, 20),
                        ]
                    },
                    {
                        'title': 'Introduction to Machine Learning',
                        'description': 'ML fundamentals with Scikit-learn',
                        'lessons': [
                            ('ML Concepts and Workflow', None, 25),
                            ('Classification Algorithms', None, 30),
                            ('Model Evaluation', None, 25),
                        ]
                    },
                ],
                'quiz_questions': [
                    ('Which library is primarily used for numerical computing in Python?', 'NumPy', 'Pandas', 'Matplotlib', 'Requests', 'a'),
                    ('What data structure does Pandas use for tabular data?', 'DataFrame', 'Array', 'Dictionary', 'Tuple', 'a'),
                    ('Which function reads a CSV file in Pandas?', 'pd.read_csv()', 'pd.load_csv()', 'pd.open_csv()', 'pd.import_csv()', 'a'),
                    ('What is the purpose of train_test_split?', 'Divide data into training and testing sets', 'Split features from labels', 'Remove duplicates', 'Normalize data', 'a'),
                    ('Which metric measures classification accuracy?', 'Accuracy score', 'Mean squared error', 'R-squared', 'Standard deviation', 'a'),
                ]
            },
            {
                'title': 'UI/UX Design Fundamentals',
                'thumbnail': '/course-thumbnails/uiux-design.jpg',
                'description': 'Learn the principles of user interface and user experience design. Covers design thinking, wireframing, prototyping, and usability testing.',
                'category': 'Design',
                'difficulty': 'beginner',
                'duration_hours': 20,
                'trainer': priya,
                'modules': [
                    {
                        'title': 'Design Thinking',
                        'description': 'Understanding the design process',
                        'lessons': [
                            ('Design Principles', 'design_principles', 20),
                            ('User Research Methods', None, 25),
                            ('Problem Definition', None, 15),
                        ]
                    },
                    {
                        'title': 'Visual Design',
                        'description': 'Typography, color, and layout',
                        'lessons': [
                            ('Typography Fundamentals', None, 20),
                            ('Color Theory and Application', None, 20),
                            ('Layout and Composition', None, 25),
                        ]
                    },
                    {
                        'title': 'Prototyping',
                        'description': 'From wireframes to high-fidelity prototypes',
                        'lessons': [
                            ('Wireframing Basics', None, 20),
                            ('High-Fidelity Prototyping', None, 25),
                            ('Design Systems', None, 20),
                        ]
                    },
                    {
                        'title': 'Usability',
                        'description': 'Testing and iterating on designs',
                        'lessons': [
                            ('Usability Testing Methods', None, 20),
                            ('Accessibility Standards', None, 25),
                            ('Iterative Design', None, 15),
                        ]
                    },
                ],
                'quiz_questions': [
                    ('What is the primary goal of UX design?', 'Create satisfying user experiences', 'Make things look pretty', 'Write clean code', 'Increase page speed', 'a'),
                    ('Which principle groups related items together?', 'Proximity', 'Contrast', 'Alignment', 'Repetition', 'a'),
                    ('What is a wireframe?', 'A low-fidelity layout sketch', 'A high-fidelity design', 'A coded prototype', 'A color palette', 'a'),
                    ('What does WCAG stand for?', 'Web Content Accessibility Guidelines', 'Web Color and Graphics', 'Worldwide Content Authoring Guide', 'Web CSS Animation Guide', 'a'),
                    ('What is a design system?', 'A collection of reusable components and guidelines', 'A programming framework', 'A project management tool', 'A version control system', 'a'),
                ]
            },
            {
                'title': 'React & TypeScript Mastery',
                'thumbnail': '/course-thumbnails/react-typescript.jpg',
                'description': 'Advanced React development with TypeScript. Build type-safe, scalable applications with modern React patterns and best practices.',
                'category': 'Development',
                'difficulty': 'intermediate',
                'duration_hours': 25,
                'trainer': ananya,
                'modules': [
                    {
                        'title': 'TypeScript Foundations',
                        'description': 'TypeScript basics for React developers',
                        'lessons': [
                            ('TypeScript Setup and Configuration', None, 20),
                            ('Types, Interfaces, and Generics', None, 25),
                            ('Advanced TypeScript Patterns', None, 30),
                        ]
                    },
                    {
                        'title': 'React with TypeScript',
                        'description': 'Type-safe React components',
                        'lessons': [
                            ('Typed Components and Props', None, 25),
                            ('Typed Hooks and Context', None, 25),
                            ('Type-safe Routing', None, 20),
                        ]
                    },
                    {
                        'title': 'State Management',
                        'description': 'Managing complex application state',
                        'lessons': [
                            ('Context API Patterns', None, 25),
                            ('Redux with TypeScript', None, 30),
                            ('Server State with React Query', None, 25),
                        ]
                    },
                    {
                        'title': 'Testing and Quality',
                        'description': 'Testing React TypeScript applications',
                        'lessons': [
                            ('Unit Testing with Vitest', None, 25),
                            ('Component Testing', None, 20),
                            ('E2E Testing with Playwright', None, 25),
                        ]
                    },
                ],
                'quiz_questions': [
                    ('What is the benefit of TypeScript over JavaScript?', 'Static type checking', 'Faster runtime performance', 'Smaller bundle sizes', 'Better CSS support', 'a'),
                    ('How do you type a React functional component?', 'React.FC<Props>', 'React.Component<Props>', 'React.Type<Props>', 'React.Fn<Props>', 'a'),
                    ('What is the purpose of generics in TypeScript?', 'Create reusable type-safe components', 'Improve runtime speed', 'Reduce bundle size', 'Add CSS types', 'a'),
                    ('Which library handles server state in React?', 'React Query / TanStack Query', 'Redux', 'Context API', 'Zustand', 'a'),
                    ('What does the `as const` assertion do?', 'Makes values readonly and narrows types', 'Converts to constant variable', 'Removes type checking', 'Creates a new constant', 'a'),
                ]
            },
            {
                'title': 'Machine Learning Basics',
                'thumbnail': '/course-thumbnails/machine-learning-basics.jpg',
                'description': 'Introduction to machine learning concepts, algorithms, and practical applications using Python and Scikit-learn.',
                'category': 'Data Science',
                'difficulty': 'beginner',
                'duration_hours': 15,
                'trainer': rohan,
                'modules': [
                    {
                        'title': 'ML Foundations',
                        'description': 'Understanding machine learning',
                        'lessons': [
                            ('What is Machine Learning?', None, 20),
                            ('Types of ML: Supervised vs Unsupervised', None, 25),
                            ('The ML Pipeline', None, 20),
                        ]
                    },
                    {
                        'title': 'Supervised Learning',
                        'description': 'Classification and regression',
                        'lessons': [
                            ('Linear Regression', None, 25),
                            ('Decision Trees', None, 25),
                            ('Support Vector Machines', None, 30),
                        ]
                    },
                    {
                        'title': 'Model Evaluation',
                        'description': 'Assessing model performance',
                        'lessons': [
                            ('Cross-Validation', None, 20),
                            ('Metrics and Scoring', None, 25),
                            ('Hyperparameter Tuning', None, 25),
                        ]
                    },
                ],
                'quiz_questions': [
                    ('Which type of ML uses labeled data?', 'Supervised learning', 'Unsupervised learning', 'Reinforcement learning', 'Semi-supervised learning', 'a'),
                    ('What algorithm is used for predicting continuous values?', 'Linear regression', 'Logistic regression', 'K-means clustering', 'Decision tree', 'a'),
                    ('What is overfitting?', 'Model memorizes training data and fails on new data', 'Model is too simple', 'Model trains too slowly', 'Model uses too much memory', 'a'),
                    ('What does cross-validation help prevent?', 'Overfitting', 'Underfitting', 'Data leakage', 'Memory issues', 'a'),
                    ('Which metric is best for imbalanced classification?', 'F1-Score', 'Accuracy', 'R-squared', 'Mean absolute error', 'a'),
                ]
            },
            {
                'title': 'Advanced CSS & Animation',
                'thumbnail': '/course-thumbnails/advanced-css.jpg',
                'description': 'Master advanced CSS techniques including animations, transitions, Grid layouts, and modern CSS features for creating stunning web experiences.',
                'category': 'Design',
                'difficulty': 'advanced',
                'duration_hours': 12,
                'trainer': priya,
                'modules': [
                    {
                        'title': 'Advanced Layouts',
                        'description': 'CSS Grid and complex layouts',
                        'lessons': [
                            ('CSS Grid Advanced Patterns', None, 25),
                            ('Flexbox vs Grid Decision Guide', None, 20),
                            ('Responsive Design Strategies', None, 25),
                        ]
                    },
                    {
                        'title': 'CSS Animations',
                        'description': 'Transitions and keyframe animations',
                        'lessons': [
                            ('CSS Transitions', None, 20),
                            ('Keyframe Animations', None, 25),
                            ('Performance Optimization', None, 20),
                        ]
                    },
                    {
                        'title': 'Modern CSS',
                        'description': 'Custom properties, container queries, and more',
                        'lessons': [
                            ('CSS Custom Properties', None, 20),
                            ('Container Queries', None, 20),
                            ('CSS Nesting and Layers', None, 15),
                        ]
                    },
                ],
                'quiz_questions': [
                    ('Which CSS property creates a grid container?', 'display: grid', 'display: flex', 'display: block', 'display: inline', 'a'),
                    ('What property controls animation duration?', 'animation-duration', 'animation-speed', 'animation-time', 'animation-length', 'a'),
                    ('What are CSS Custom Properties also called?', 'CSS Variables', 'CSS Constants', 'CSS Mixins', 'CSS Functions', 'a'),
                    ('Which property triggers hardware acceleration?', 'transform', 'top/left', 'margin', 'padding', 'a'),
                    ('What is the purpose of will-change?', 'Hint browser about upcoming changes for optimization', 'Force layout recalculation', 'Reset animations', 'Disable transitions', 'a'),
                ]
            },
        ]

        all_courses = []
        all_quizzes = []
        for cd in courses_data:
            course = Course(
                title=cd['title'],
                description=cd['description'],
                category=cd['category'],
                difficulty=cd['difficulty'],
                duration_hours=cd['duration_hours'],
                thumbnail=cd.get('thumbnail'),
                is_published=True,
                trainer_id=cd['trainer'].id
            )
            db.session.add(course)
            db.session.commit()
            all_courses.append(course)

            for mi, md in enumerate(cd['modules']):
                module = Module(
                    title=md['title'],
                    description=md['description'],
                    order=mi + 1,
                    course_id=course.id
                )
                db.session.add(module)
                db.session.commit()

                for li, (ltitle, lkey, ldur) in enumerate(md['lessons']):
                    lesson = Lesson(
                        title=ltitle,
                        content=LESSON_THEORY.get(ltitle) or get_content(lkey),
                        type='text',
                        duration_minutes=ldur,
                        order=li + 1,
                        module_id=module.id
                    )
                    db.session.add(lesson)
                db.session.commit()

            # Create quiz
            quiz = Quiz(
                title=f'Assessment: {course.title}',
                description=f'Test your knowledge of {course.title}',
                passing_score=60.0,
                course_id=course.id,
                time_limit_minutes=30
            )
            db.session.add(quiz)
            db.session.commit()
            all_quizzes.append(quiz)

            for qi, (qtext, oa, ob, oc, od, correct) in enumerate(cd['quiz_questions']):
                question = Question(
                    quiz_id=quiz.id,
                    text=qtext,
                    option_a=oa,
                    option_b=ob,
                    option_c=oc,
                    option_d=od,
                    correct_option=correct,
                    order=qi + 1,
                    points=1
                )
                db.session.add(question)
            db.session.commit()

        c1, c2, c3, c4, c5, c6 = all_courses
        q1, q2, q3, q4, q5, q6 = all_quizzes

        print("Creating enrollments and progress...")
        now = datetime.now(timezone.utc)

        def complete_course(user, course, quiz, score_correct, days_ago=5):
            enrolled_at = now - timedelta(days=days_ago + 30)
            completed_at = now - timedelta(days=days_ago)

            e = Enrollment(user_id=user.id, course_id=course.id, status='completed',
                          enrolled_at=enrolled_at, completed_at=completed_at)
            db.session.add(e)
            db.session.commit()

            for m in course.modules:
                for l in m.lessons:
                    lp = LessonProgress(user_id=user.id, lesson_id=l.id, completed=True,
                                       completed_at=completed_at - timedelta(hours=random.randint(1, 48)))
                    db.session.add(lp)
            db.session.commit()

            total_q = len(quiz.questions)
            score = score_correct
            attempt = QuizAttempt(
                user_id=user.id, quiz_id=quiz.id,
                score=score, total_points=total_q,
                percentage=round(score / total_q * 100, 1),
                passed=True,
                started_at=completed_at - timedelta(minutes=25),
                completed_at=completed_at
            )
            db.session.add(attempt)
            db.session.commit()

            for i, question in enumerate(quiz.questions):
                is_correct = i < score_correct
                ans = QuizAnswer(
                    attempt_id=attempt.id,
                    question_id=question.id,
                    selected_option=question.correct_option if is_correct else 'b',
                    is_correct=is_correct
                )
                db.session.add(ans)
            db.session.commit()

            cert = Certificate(
                certificate_uid=str(uuid.uuid4())[:12].upper(),
                user_id=user.id,
                course_id=course.id,
                trainer_name=course.trainer.name,
                course_title=course.title,
                issued_at=completed_at
            )
            db.session.add(cert)

            activities = [
                Activity(user_id=user.id, type='enrollment',
                         description=f'Enrolled in {course.title}', created_at=enrolled_at),
                Activity(user_id=user.id, type='course_complete',
                         description=f'Completed {course.title}', created_at=completed_at),
                Activity(user_id=user.id, type='certificate_issued',
                         description=f'Certificate issued for {course.title}', created_at=completed_at),
            ]
            db.session.add_all(activities)
            db.session.commit()

        def partial_enroll(user, course, lessons_completed_ratio, days_ago=10):
            enrolled_at = now - timedelta(days=days_ago)
            e = Enrollment(user_id=user.id, course_id=course.id, status='active',
                          enrolled_at=enrolled_at)
            db.session.add(e)
            db.session.commit()

            all_lessons = [l for m in course.modules for l in m.lessons]
            num_to_complete = int(len(all_lessons) * lessons_completed_ratio)
            for l in all_lessons[:num_to_complete]:
                lp = LessonProgress(user_id=user.id, lesson_id=l.id, completed=True,
                                   completed_at=enrolled_at + timedelta(days=random.randint(1, days_ago)))
                db.session.add(lp)

            activity = Activity(user_id=user.id, type='enrollment',
                               description=f'Enrolled in {course.title}', created_at=enrolled_at)
            db.session.add(activity)
            db.session.commit()

        # Arjun: completed Full-Stack Web Dev, active in React & TS (70%), active in Python DS (30%)
        complete_course(arjun, c1, q1, 6, days_ago=3)
        partial_enroll(arjun, c4, 0.7, days_ago=15)
        partial_enroll(arjun, c2, 0.3, days_ago=8)

        # Kavya: completed Python for DS, active in ML Basics (60%), active in UI/UX (20%)
        complete_course(kavya, c2, q2, 4, days_ago=7)
        partial_enroll(kavya, c5, 0.6, days_ago=12)
        partial_enroll(kavya, c3, 0.2, days_ago=5)

        # Raj: active in Full-Stack (low ~7%), active in React TS (low ~8%)
        partial_enroll(raj, c1, 0.07, days_ago=20)
        partial_enroll(raj, c4, 0.08, days_ago=14)

        # Add a failed quiz attempt for Raj
        raj_attempt = QuizAttempt(
            user_id=raj.id, quiz_id=q1.id,
            score=2, total_points=7,
            percentage=28.6, passed=False,
            started_at=now - timedelta(days=10),
            completed_at=now - timedelta(days=10)
        )
        db.session.add(raj_attempt)
        db.session.commit()
        for i, question in enumerate(q1.questions):
            ans = QuizAnswer(
                attempt_id=raj_attempt.id,
                question_id=question.id,
                selected_option='a' if i < 2 else 'c',
                is_correct=i < 2
            )
            db.session.add(ans)
        db.session.commit()

        # Neha: completed UI/UX Design, active in Advanced CSS (50%), active in Full-Stack (40%)
        complete_course(neha, c3, q3, 5, days_ago=10)
        partial_enroll(neha, c6, 0.5, days_ago=8)
        partial_enroll(neha, c1, 0.4, days_ago=6)

        # Vikram: active in ML Basics (80%), active in Python DS (55%)
        partial_enroll(vikram, c5, 0.8, days_ago=18)
        partial_enroll(vikram, c2, 0.55, days_ago=12)

        # Add some lesson-complete activities for variety
        for user, desc, days in [
            (arjun, 'Completed lesson: React State and Props', 2),
            (kavya, 'Completed lesson: Linear Regression', 3),
            (vikram, 'Completed lesson: Hyperparameter Tuning', 1),
            (neha, 'Completed lesson: CSS Transitions', 4),
            (arjun, 'Completed lesson: Typed Components and Props', 1),
        ]:
            act = Activity(user_id=user.id, type='lesson_complete',
                          description=desc, created_at=now - timedelta(days=days))
            db.session.add(act)
        db.session.commit()

        print("Database seeded successfully!")
        print()
        print("=== Demo Credentials ===")
        print("Admin:    admin@capacityconnect.com / Admin@123")
        print("Trainer:  ananya.iyer@example.com / Trainer@123")
        print("Trainer:  rohan.mehta@example.com / Trainer@123")
        print("Trainer:  priya.sharma@example.com / Trainer@123")
        print("Trainee:  arjun.nair@example.com / Trainee@123")
        print("Trainee:  kavya.reddy@example.com / Trainee@123")
        print("Trainee:  raj.patel@example.com / Trainee@123")
        print("Trainee:  neha.gupta@example.com / Trainee@123")
        print("Trainee:  vikram.singh@example.com / Trainee@123")

if __name__ == '__main__':
    seed_db()
