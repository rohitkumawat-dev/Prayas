"""Theory + module quizzes: Python for Data Science."""

LESSONS = {
"Introduction to Python": """# Introduction to Python

## Why Python for data science?
Python is readable, has a huge ecosystem (NumPy, Pandas, Matplotlib, scikit-learn) and is used from quick analysis to production machine learning.

## Running Python
Use the interpreter (`python file.py`), a notebook (Jupyter) or an IDE. Notebooks mix code, output and notes, which is ideal for exploration.

## Basics
```python
name = "Asha"
hours = 12
price = 49.99
is_active = True

print(f"{name} studied {hours} hours")   # f-string
```
Python uses **indentation** to define blocks; there are no braces. Variables are dynamically typed: the type belongs to the value, not the name.

## Operators
Arithmetic (`+ - * / // % **`), comparison (`== != < >`), logical (`and or not`), membership (`in`).

`7 / 2` is `3.5`; `7 // 2` is `3` (floor division).

## Virtual environments and packages
```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\\Scripts\\activate
pip install pandas numpy matplotlib
```
A virtual environment isolates a project's dependencies so projects do not conflict.

## Style
Follow **PEP 8**: 4-space indentation, `snake_case` for variables and functions, `CapWords` for classes.

> **Key takeaway:** Python's clarity lets you focus on the data problem rather than the syntax.""",

"Data Types and Structures": """# Data Types and Structures

## Core built-in structures
| Structure | Ordered | Mutable | Duplicates |
|---|---|---|---|
| list | yes | yes | yes |
| tuple | yes | no | yes |
| set | no | yes | no |
| dict | insertion order | yes | keys unique |

## Lists
```python
scores = [72, 85, 90]
scores.append(64)
top = scores[1:3]        # slicing -> [85, 90]
```

## Dictionaries
```python
student = {"name": "Ravi", "score": 88}
student["passed"] = True
for key, value in student.items():
    print(key, value)
```

## Sets
Useful for uniqueness and fast membership tests: `set([1, 2, 2, 3])` gives `{1, 2, 3}`.

## Comprehensions
```python
squares = [n ** 2 for n in range(5)]              # [0, 1, 4, 9, 16]
high = {k: v for k, v in scores_by_name.items() if v > 80}
```

## Mutability matters
Assigning `b = a` for a list does **not** copy it; both names point to the same list. Use `a.copy()` when you need an independent copy.

## Strings
Strings are immutable sequences: `"data".upper()`, `" hi ".strip()`, `"a,b".split(",")`.

> **Key takeaway:** choose the structure that fits the job: lists for ordered data, dicts for lookups, sets for uniqueness.""",

"Control Flow and Functions": """# Control Flow and Functions

## Conditionals
```python
if score >= 80:
    grade = "A"
elif score >= 60:
    grade = "B"
else:
    grade = "C"
```

## Loops
```python
for i in range(3):
    print(i)

for index, name in enumerate(names):
    print(index, name)

while queue:
    process(queue.pop())
```
`break` exits a loop; `continue` skips to the next iteration.

## Functions
```python
def average(values, ndigits=2):
    \"\"\"Return the mean of a list of numbers.\"\"\"
    if not values:
        return 0.0
    return round(sum(values) / len(values), ndigits)
```
- Parameters can have **default values**.
- Use **docstrings** to document purpose.
- Functions without `return` give back `None`.

## Scope
Variables created inside a function are local. Prefer passing values in and returning results instead of modifying globals.

## Error handling
```python
try:
    value = int(text)
except ValueError:
    value = 0
finally:
    print("done")
```

## Files
```python
with open("data.csv") as f:
    for line in f:
        print(line.strip())
```
The `with` statement closes the file automatically.

> **Key takeaway:** small, well-named functions with clear inputs and outputs make analysis code reusable and testable.""",

"Introduction to Pandas": """# Introduction to Pandas

## What Pandas provides
Pandas offers two core structures: **Series** (one labelled column) and **DataFrame** (a table of columns). It is the standard tool for tabular data in Python.

## Loading and inspecting
```python
import pandas as pd

df = pd.read_csv("students.csv")
df.head()        # first rows
df.info()        # columns, dtypes, non-null counts
df.describe()    # count, mean, std, min, quartiles, max
df.shape         # (rows, columns)
```

## Selecting data
```python
df["score"]                       # one column (Series)
df[["name", "score"]]             # several columns
df.loc[0, "name"]                 # by label
df.iloc[0:5, 0:2]                 # by position
df[df["score"] > 80]              # boolean filter
df[(df.score > 80) & (df.city == "Pune")]
```
Use `&`, `|`, `~` with parentheses for combining conditions (not `and`/`or`).

## Creating columns
```python
df["passed"] = df["score"] >= 60
df["score_pct"] = df["score"] / df["max_score"] * 100
```

## Sorting
```python
df.sort_values("score", ascending=False)
```

## Vectorisation
Operations apply to whole columns at once, which is much faster than looping over rows.

> **Key takeaway:** think in columns. Filter, transform and derive new columns rather than looping.""",

"Data Cleaning Techniques": """# Data Cleaning Techniques

Real data is messy. Analysts often spend most of their time cleaning it.

## Missing values
```python
df.isna().sum()                    # count missing per column
df.dropna(subset=["score"])        # drop rows missing score
df["score"].fillna(df["score"].median())   # impute
```
Choose a strategy deliberately: dropping loses data; imputing with the mean or median assumes the values are missing at random.

## Duplicates
```python
df.duplicated().sum()
df = df.drop_duplicates()
```

## Fixing types
```python
df["date"] = pd.to_datetime(df["date"], errors="coerce")
df["age"] = pd.to_numeric(df["age"], errors="coerce")
df["city"] = df["city"].astype("category")
```

## Text cleaning
```python
df["name"] = df["name"].str.strip().str.title()
df["email"] = df["email"].str.lower()
```

## Outliers
Inspect with `describe()` or a box plot. The **IQR rule** flags values below Q1 − 1.5×IQR or above Q3 + 1.5×IQR. Decide whether an outlier is an error (fix it) or a real extreme (keep it).

## Renaming and reshaping
`df.rename(columns={"old": "new"})`, `df.melt()` (wide to long), `df.pivot()` (long to wide).

## Keep it reproducible
Perform cleaning in code, not by hand in a spreadsheet, and keep the raw file untouched.

> **Key takeaway:** detect, decide, document. Every cleaning choice can change your results.""",

"Grouping and Aggregation": """# Grouping and Aggregation

## Split-apply-combine
`groupby` splits rows into groups by a key, applies a function to each group and combines the results.

```python
df.groupby("course")["score"].mean()

df.groupby("course").agg(
    learners=("student_id", "nunique"),
    avg_score=("score", "mean"),
    best=("score", "max"),
)
```

## Multiple keys
```python
df.groupby(["course", "city"])["score"].mean().reset_index()
```

## Common aggregations
`count`, `sum`, `mean`, `median`, `min`, `max`, `std`, `nunique`.

## Pivot tables
```python
pd.pivot_table(df, values="score", index="course",
               columns="city", aggfunc="mean")
```

## Merging data
```python
merged = students.merge(enrollments, on="student_id", how="left")
```
Join types: `inner` (matches only), `left` (all from left), `right`, `outer`.

## Sorting and ranking results
```python
top3 = (df.groupby("course")["score"].mean()
          .sort_values(ascending=False).head(3))
```

## Watch out
`count` ignores missing values while `size` counts all rows in a group.

> **Key takeaway:** most business questions ("average score per course?") are one `groupby` away.""",

"Matplotlib Basics": """# Matplotlib Basics

## Why visualise?
Charts reveal patterns, outliers and relationships that tables hide.

## Figure and axes
```python
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot([1, 2, 3, 4], [10, 20, 15, 30], marker="o")
ax.set_title("Weekly sign-ups")
ax.set_xlabel("Week")
ax.set_ylabel("Learners")
plt.show()
```
A **Figure** is the canvas; an **Axes** is one plot on it.

## Common chart types
| Question | Chart |
|---|---|
| Trend over time | Line (`ax.plot`) |
| Compare categories | Bar (`ax.bar`) |
| Distribution of one variable | Histogram (`ax.hist`) |
| Relationship of two variables | Scatter (`ax.scatter`) |
| Share of a whole | Pie (use sparingly) |

## Multiple plots
```python
fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].hist(df["score"], bins=10)
axes[1].scatter(df["hours"], df["score"])
```

## Good chart design
- Always label axes and add units.
- Start bar charts at zero.
- Limit colours and remove clutter.
- Save with `fig.savefig("chart.png", dpi=200, bbox_inches="tight")`.

> **Key takeaway:** choose the chart type from the question you are answering, then label everything.""",

"Seaborn for Statistical Plots": """# Seaborn for Statistical Plots

## What Seaborn adds
Seaborn is built on Matplotlib and produces attractive statistical charts from DataFrames with very little code.

```python
import seaborn as sns
sns.set_theme()
```

## Distribution plots
```python
sns.histplot(df["score"], kde=True)
sns.boxplot(data=df, x="course", y="score")
sns.violinplot(data=df, x="course", y="score")
```
A **box plot** shows the median, quartiles and outliers.

## Relationship plots
```python
sns.scatterplot(data=df, x="hours", y="score", hue="course")
sns.regplot(data=df, x="hours", y="score")     # adds a trend line
sns.pairplot(df[["hours", "score", "age"]])    # every pair of variables
```

## Categorical plots
```python
sns.barplot(data=df, x="course", y="score", estimator="mean")
sns.countplot(data=df, x="city")
```

## Correlation heatmap
```python
sns.heatmap(df.corr(numeric_only=True), annot=True, cmap="coolwarm", vmin=-1, vmax=1)
```
Correlation ranges from −1 to +1. **Correlation does not imply causation.**

## Tip
Seaborn returns Matplotlib objects, so you can still customise titles and labels with `plt.title(...)`.

> **Key takeaway:** use Seaborn to explore distributions and relationships fast, especially with `hue` for comparing groups.""",

"Interactive Visualizations": """# Interactive Visualizations

## Why interactivity?
Hover tooltips, zoom, filtering and toggling series let readers explore data themselves, which suits dashboards and presentations.

## Plotly Express
```python
import plotly.express as px

fig = px.scatter(
    df, x="hours", y="score", color="course",
    size="attempts", hover_data=["name"],
    title="Study hours vs score",
)
fig.show()
```
Other one-liners: `px.line`, `px.bar`, `px.histogram`, `px.box`, `px.choropleth`.

## Customising
```python
fig.update_layout(template="plotly_dark", legend_title="Course")
fig.write_html("report.html")      # share as a standalone file
```

## Dashboards
Libraries such as **Dash** and **Streamlit** turn Python analysis into web apps with dropdowns and sliders.

## Design guidance
- Interactivity should answer questions, not decorate.
- Give sensible defaults so the first view is already informative.
- Test on different screen sizes and keep colour choices accessible (avoid relying on red/green alone).

## Static vs interactive
Use static charts for reports and printing; interactive charts for exploration and dashboards.

> **Key takeaway:** Plotly Express gives interactive charts in one line, and Dash/Streamlit turn them into shareable apps.""",

"ML Concepts and Workflow": """# ML Concepts and Workflow

## What is machine learning?
Instead of writing explicit rules, we let an algorithm **learn patterns from data** and use them to make predictions on new data.

## Vocabulary
- **Features (X)**: input variables.
- **Target/label (y)**: what we want to predict.
- **Training set** vs **test set**: data used to learn vs data held back to evaluate.
- **Model**: the learned function.

## The workflow
1. Define the problem and success metric.
2. Collect and clean data.
3. Explore and engineer features.
4. Split into train and test sets.
5. Train a model.
6. Evaluate on the test set.
7. Improve, then deploy and monitor.

## Example with scikit-learn
```python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)
print(model.score(X_test, y_test))
```

## Overfitting and underfitting
- **Overfitting**: excellent on training data, poor on new data (memorised noise).
- **Underfitting**: too simple to capture the pattern.

## Data leakage
Never let information from the test set influence training (for example, scaling using statistics computed on all data).

> **Key takeaway:** always evaluate on data the model has never seen.""",

"Classification Algorithms": """# Classification Algorithms

Classification predicts a **category**: spam or not spam, pass or fail.

## Logistic regression
Despite the name, it is a classifier. It outputs a probability using the sigmoid function and applies a threshold (usually 0.5). Fast, interpretable, a great baseline.

## k-Nearest Neighbours (k-NN)
Classifies a point by the majority class of its *k* closest training points. Needs **feature scaling** because it relies on distance.

## Decision trees and random forests
A tree asks a sequence of yes/no questions about features. A **random forest** averages many trees trained on random subsets, reducing overfitting.

```python
from sklearn.ensemble import RandomForestClassifier
clf = RandomForestClassifier(n_estimators=200, random_state=42)
clf.fit(X_train, y_train)
pred = clf.predict(X_test)
```

## Choosing an algorithm
| Algorithm | Strength | Weakness |
|---|---|---|
| Logistic regression | Simple, interpretable | Linear boundaries only |
| k-NN | No training step | Slow on big data, needs scaling |
| Random forest | Accurate, robust | Less interpretable |

## Class imbalance
If 95% of examples are one class, a model that always predicts it scores 95% accuracy yet is useless. Use stratified splits, class weights and metrics beyond accuracy.

> **Key takeaway:** start with a simple baseline, compare a few algorithms fairly, and be careful with imbalanced classes.""",

"Model Evaluation": """# Model Evaluation

## Why accuracy is not enough
Accuracy = correct predictions ÷ all predictions. It hides problems when classes are imbalanced.

## The confusion matrix
| | Predicted positive | Predicted negative |
|---|---|---|
| Actual positive | True Positive (TP) | False Negative (FN) |
| Actual negative | False Positive (FP) | True Negative (TN) |

## Key metrics
- **Precision** = TP / (TP + FP): of the predicted positives, how many were right?
- **Recall** = TP / (TP + FN): of the real positives, how many did we find?
- **F1-score**: harmonic mean of precision and recall.

Choose by cost: in disease screening a missed case (FN) is costly, so favour **recall**; in spam filtering a wrongly blocked email (FP) hurts, so favour **precision**.

## In code
```python
from sklearn.metrics import classification_report, confusion_matrix
print(confusion_matrix(y_test, pred))
print(classification_report(y_test, pred))
```

## Cross-validation
Splitting once can be lucky or unlucky. **k-fold cross-validation** trains and tests k times on different splits and averages the score.
```python
from sklearn.model_selection import cross_val_score
scores = cross_val_score(model, X, y, cv=5)
print(scores.mean(), scores.std())
```

## Regression metrics
MAE (average absolute error), RMSE (penalises large errors) and R² (share of variance explained).

> **Key takeaway:** pick the metric that reflects the real-world cost of mistakes, and validate with more than one split.""",
}

QUIZZES = {
"Python Foundations": [
 ("Which structure is ordered and mutable?", "tuple", "set", "list", "frozenset", "c"),
 ("What does `7 // 2` evaluate to in Python?", "3.5", "3", "4", "1", "b"),
 ("Why use a virtual environment?", "To speed up the CPU", "To isolate a project's dependencies", "To compile Python", "To hide source code", "b"),
 ("Which keyword ensures a file is closed automatically?", "with", "using", "close", "finally-only", "a"),
 ("What happens with `b = a` when `a` is a list?", "b is an independent copy", "Both names refer to the same list", "A syntax error", "b becomes a tuple", "b"),
],
"Data Manipulation with Pandas": [
 ("Which method reveals the number of missing values per column?", "df.isna().sum()", "df.count_null()", "df.missing()", "df.shape", "a"),
 ("How do you combine two boolean conditions in a Pandas filter?", "and / or", "& / | with parentheses", "&& / ||", "+ / -", "b"),
 ("What does `df.groupby('course')['score'].mean()` return?", "The overall mean", "The mean score per course", "The number of courses", "The highest score", "b"),
 ("Which `merge` type keeps all rows from the left table?", "inner", "outer", "left", "cross", "c"),
 ("Why is vectorisation preferred over looping over rows?", "It is faster and clearer", "It uses less disk space", "Loops are illegal in Pandas", "It removes duplicates", "a"),
],
"Data Visualization": [
 ("Which chart best shows a trend over time?", "Pie chart", "Line chart", "Box plot", "Heatmap", "b"),
 ("What does a correlation of -0.9 indicate?", "No relationship", "A strong positive relationship", "A strong negative relationship", "A causal link", "c"),
 ("Which Seaborn function plots every pairwise relationship in a dataset?", "sns.pairplot", "sns.countplot", "sns.barplot", "sns.kdeplot", "a"),
 ("Bar charts should normally...", "Start the axis at zero", "Use 3D effects", "Omit labels", "Use random colours", "a"),
 ("Which library is designed for hover-enabled interactive charts?", "NumPy", "Plotly", "os", "json", "b"),
],
"Introduction to Machine Learning": [
 ("What is the purpose of a test set?", "To train the model", "To evaluate on unseen data", "To clean data", "To store labels", "b"),
 ("A model that scores very high on training data but poorly on new data is...", "Underfitting", "Overfitting", "Well generalised", "Unbiased", "b"),
 ("Which metric answers 'of all real positives, how many did we find?'", "Precision", "Recall", "Accuracy", "R²", "b"),
 ("Why can accuracy mislead with imbalanced classes?", "It cannot be computed", "A model predicting the majority class can score high while being useless", "It is always 50%", "It ignores the test set", "b"),
 ("What does k-fold cross-validation do?", "Trains once on all data", "Trains and tests k times on different splits", "Removes k features", "Doubles the dataset", "b"),
],
}
