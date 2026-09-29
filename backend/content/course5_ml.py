"""Theory + module quizzes: Machine Learning Basics."""

LESSONS = {
"What is Machine Learning?": """# What is Machine Learning?

## A new way to program
In traditional programming you write **rules** and supply **data** to get answers. In machine learning you supply **data and answers** and the algorithm learns the **rules**.

## A short definition
Machine learning (ML) is the study of algorithms that improve their performance on a task through experience (data), without being explicitly programmed for every case.

## Where you meet ML
Spam filters, recommendations, fraud detection, speech recognition, medical imaging, demand forecasting.

## AI, ML, deep learning
- **Artificial intelligence**: the broad goal of machines performing tasks that need intelligence.
- **Machine learning**: a subset that learns from data.
- **Deep learning**: a subset of ML using multi-layer neural networks, strong for images, audio and text.

## Ingredients of every ML problem
1. **Data**: examples with features (inputs).
2. **Model**: a function with adjustable parameters.
3. **Loss function**: measures how wrong predictions are.
4. **Optimiser**: adjusts parameters to reduce the loss (for example gradient descent).

## When NOT to use ML
When simple rules work, when you lack data, or when errors are unacceptable and cannot be checked. ML adds complexity and needs maintenance.

## Data quality
"Garbage in, garbage out": biased, incomplete or mislabelled data produces unreliable models.

> **Key takeaway:** ML learns patterns from examples; its quality is limited by the data and by how success is measured.""",

"Types of ML: Supervised vs Unsupervised": """# Types of ML: Supervised vs Unsupervised

## Supervised learning
The data includes the **correct answers (labels)**. The model learns to map inputs to outputs.
- **Classification**: predict a category (spam / not spam).
- **Regression**: predict a number (house price).

## Unsupervised learning
There are **no labels**; the model finds structure on its own.
- **Clustering**: group similar items (customer segments) with k-means.
- **Dimensionality reduction**: compress many features into a few (PCA).
- **Anomaly detection**: find unusual points.

## Semi-supervised and self-supervised
A little labelled data plus lots of unlabelled data; or the data creates its own labels (predict the next word), which powers modern language models.

## Reinforcement learning
An **agent** takes actions in an environment and receives **rewards**; it learns a policy to maximise total reward (games, robotics).

## Comparison
| Type | Data | Example |
|---|---|---|
| Supervised | Labelled | Predict loan default |
| Unsupervised | Unlabelled | Segment customers |
| Reinforcement | Rewards | Train a game-playing agent |

## Choosing
Do you have labels and a clear prediction target? Use supervised. Exploring unknown structure? Use unsupervised.

```python
from sklearn.cluster import KMeans
labels = KMeans(n_clusters=3, random_state=0).fit_predict(X)
```

> **Key takeaway:** the presence or absence of labels decides which family of algorithms you can use.""",

"The ML Pipeline": """# The ML Pipeline

## End-to-end stages
1. **Problem framing**: what decision will the model support, and how is success measured?
2. **Data collection**: gather representative data.
3. **Data preparation**: clean, encode and scale.
4. **Feature engineering**: create informative inputs.
5. **Training**: fit the model.
6. **Evaluation**: measure performance on unseen data.
7. **Deployment**: serve predictions.
8. **Monitoring**: watch for **data drift** and degrading accuracy.

## Preprocessing essentials
- Handle missing values.
- **Encode categorical variables** (one-hot encoding).
- **Scale numeric features** (standardisation) for distance-based or gradient-based models.

## Pipelines in scikit-learn
```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

pipe = Pipeline([
    ("scale", StandardScaler()),
    ("model", LogisticRegression(max_iter=1000)),
])
pipe.fit(X_train, y_train)
print(pipe.score(X_test, y_test))
```
A pipeline applies the same steps to training and new data and **prevents data leakage** because scaling statistics are learned from the training split only.

## Splitting data
Train / validation / test: train to learn, validation to tune, test once at the end.

## Deployment and monitoring
Models decay as the world changes. Track input distributions, prediction quality and business impact, and retrain when needed.

> **Key takeaway:** the model is one small step; data preparation, evaluation and monitoring decide real-world success.""",

"Linear Regression": """# Linear Regression

## The idea
Linear regression predicts a number by fitting a straight line (or plane) through the data:

**ŷ = b₀ + b₁x₁ + b₂x₂ + ...**

`b₀` is the intercept; each `bᵢ` is the change in ŷ for a one-unit change in `xᵢ`, holding others constant.

## How it learns
It chooses coefficients that minimise the **sum of squared errors** (ordinary least squares). Squaring penalises large errors and makes the maths tractable.

## In code
```python
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

model = LinearRegression().fit(X_train, y_train)
pred = model.predict(X_test)
print("R2:", r2_score(y_test, pred))
print("RMSE:", mean_squared_error(y_test, pred) ** 0.5)
print(model.coef_, model.intercept_)
```

## Evaluating
- **MAE**: average absolute error.
- **RMSE**: emphasises large errors.
- **R²**: proportion of variance explained (1 is perfect; 0 equals predicting the mean).

## Assumptions
Roughly linear relationship, independent errors, constant error variance, and no severe **multicollinearity** between features.

## Regularisation
**Ridge (L2)** and **Lasso (L1)** add a penalty on large coefficients to reduce overfitting; Lasso can shrink some to zero (feature selection).

## Pitfalls
Outliers pull the line strongly; extrapolating beyond the data range is unreliable.

> **Key takeaway:** linear regression is simple, fast and interpretable, and an excellent baseline for numeric prediction.""",

"Decision Trees": """# Decision Trees

## The idea
A decision tree predicts by asking a series of questions about features, splitting the data into ever purer groups until it reaches a **leaf** with a prediction.

```
Hours studied > 5?
├── yes → Attended all sessions? → Pass / Fail
└── no  → Fail
```

## How splits are chosen
At each node the algorithm picks the feature and threshold that best separates the classes, measured by **Gini impurity** or **entropy (information gain)**. For regression it minimises variance.

## In code
```python
from sklearn.tree import DecisionTreeClassifier, export_text
tree = DecisionTreeClassifier(max_depth=3, random_state=42).fit(X_train, y_train)
print(export_text(tree, feature_names=list(X.columns)))
```

## Strengths
- Easy to interpret and visualise.
- Handles numeric and categorical data with little preprocessing.
- No need for feature scaling.

## Weaknesses
A deep tree **overfits**, memorising the training data. Control it with `max_depth`, `min_samples_leaf` or pruning.

## Ensembles
- **Random forest**: many trees on random samples of rows and features; predictions are averaged or voted (reduces variance).
- **Gradient boosting** (XGBoost, LightGBM): trees built sequentially, each correcting the previous errors; often top performers on tabular data.

## Feature importance
Trees show which features contributed most to splits, helping explain results.

> **Key takeaway:** single trees are interpretable but overfit; ensembles trade some interpretability for accuracy.""",

"Support Vector Machines": """# Support Vector Machines

## The idea
An SVM finds the decision boundary (a **hyperplane**) that separates classes with the **largest possible margin**. The points closest to the boundary are the **support vectors**; only they determine the boundary.

## Soft margin and C
Real data overlaps, so SVMs allow some misclassification. The parameter **C** controls the trade-off:
- **High C**: strict, narrow margin, risk of overfitting.
- **Low C**: wider margin, tolerates errors, smoother boundary.

## The kernel trick
When classes are not linearly separable, a **kernel** implicitly maps data into a higher-dimensional space where a linear separator exists.
- `linear`: for roughly linear data or many features.
- `rbf` (Gaussian): a flexible default; controlled by **gamma** (how far a single example's influence reaches).
- `poly`: polynomial boundaries.

## In code
```python
from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

clf = make_pipeline(StandardScaler(), SVC(kernel="rbf", C=1.0, gamma="scale"))
clf.fit(X_train, y_train)
```
**Always scale features** for SVMs; they are distance-based.

## Strengths and limits
- Effective in high-dimensional spaces and on small to medium data sets.
- Training scales poorly to very large data sets.
- Less interpretable and does not output probabilities by default.

## When to use
Text classification, image features, bioinformatics, and any small, well-scaled data set with clear margins.

> **Key takeaway:** maximise the margin, use kernels for curved boundaries, and tune C and gamma with cross-validation.""",

"Cross-Validation": """# Cross-Validation

## The problem
A single train/test split can be lucky or unlucky. Cross-validation (CV) gives a more reliable estimate of how a model will perform on unseen data.

## k-fold CV
1. Split the data into **k folds** (commonly 5 or 10).
2. Train on k−1 folds and validate on the remaining one.
3. Repeat k times so each fold is the validation set once.
4. Average the scores; report the mean and standard deviation.

```python
from sklearn.model_selection import cross_val_score, StratifiedKFold

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=cv, scoring="f1")
print(f"{scores.mean():.3f} ± {scores.std():.3f}")
```

## Variants
- **Stratified k-fold**: preserves class proportions (use for classification).
- **Leave-one-out**: k equals the number of samples (expensive).
- **TimeSeriesSplit**: for time-ordered data; never train on the future.
- **Group k-fold**: keeps all rows from one group (for example one patient) together.

## Avoiding data leakage
Do all preprocessing **inside** the cross-validation loop (use a Pipeline), or information from the validation fold leaks into training.

## Keep a final test set
Use CV for model selection and tuning; evaluate the chosen model once on a held-out test set.

> **Key takeaway:** average several validation scores instead of trusting a single split, and never let validation data influence training.""",

"Metrics and Scoring": """# Metrics and Scoring

## Classification metrics
From the confusion matrix (TP, FP, FN, TN):
- **Accuracy** = (TP + TN) / total
- **Precision** = TP / (TP + FP)
- **Recall (sensitivity)** = TP / (TP + FN)
- **F1** = 2 × precision × recall / (precision + recall)

## Which metric?
| Situation | Prefer |
|---|---|
| Balanced classes, equal costs | Accuracy |
| False alarms are costly (spam blocking a real email) | Precision |
| Missing a case is costly (disease screening) | Recall |
| Need a balance on imbalanced data | F1 |

## Threshold-independent metrics
- **ROC curve**: true positive rate vs false positive rate across thresholds; **AUC** summarises it (0.5 = random, 1.0 = perfect).
- **Precision-recall curve**: more informative when positives are rare.

## Probabilities and thresholds
Most classifiers output a probability. Moving the threshold trades precision for recall.
```python
from sklearn.metrics import classification_report, roc_auc_score
print(classification_report(y_test, pred))
print(roc_auc_score(y_test, model.predict_proba(X_test)[:, 1]))
```

## Regression metrics
MAE, MSE/RMSE, R², and MAPE (percentage error).

## Business alignment
Translate metrics into cost: what does a false positive or false negative actually cost?

> **Key takeaway:** the right metric is the one that reflects the real cost of errors, not the one that gives the biggest number.""",

"Hyperparameter Tuning": """# Hyperparameter Tuning

## Parameters vs hyperparameters
**Parameters** are learned from data (coefficients, tree splits). **Hyperparameters** are set before training and control learning: tree `max_depth`, SVM `C`, k in k-NN, learning rate.

## Search strategies
- **Grid search**: try every combination in a grid. Thorough but expensive.
- **Random search**: sample combinations randomly; often finds good settings faster.
- **Bayesian optimisation** (Optuna, scikit-optimize): uses past results to choose the next trial.

## In code
```python
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import RandomForestClassifier

grid = {
    "n_estimators": [100, 300],
    "max_depth": [None, 5, 10],
    "min_samples_leaf": [1, 3],
}
search = GridSearchCV(RandomForestClassifier(random_state=42),
                      grid, cv=5, scoring="f1", n_jobs=-1)
search.fit(X_train, y_train)
print(search.best_params_, search.best_score_)
```

## Bias-variance trade-off
- **High bias (underfitting)**: model too simple; both training and validation errors are high.
- **High variance (overfitting)**: training error low, validation error high.
Tuning finds the balance. **Learning curves** help diagnose which problem you have.

## Avoid overfitting the validation set
Tuning many settings can overfit the validation scores. Keep an untouched test set for the final estimate.

## Practical advice
Start with defaults, tune the few most influential hyperparameters, and use a sensible budget.

> **Key takeaway:** tune with cross-validation, use random or Bayesian search for large spaces, and confirm on a held-out test set.""",
}

QUIZZES = {
"ML Foundations": [
 ("In supervised learning the training data includes...", "No labels", "Labels or correct answers", "Only images", "Only rewards", "b"),
 ("Which task is an example of regression?", "Deciding spam or not spam", "Predicting a house price", "Grouping customers into segments", "Detecting an outlier only", "b"),
 ("k-means clustering is an example of...", "Supervised learning", "Unsupervised learning", "Reinforcement learning only", "Rule-based programming", "b"),
 ("Why use a Pipeline that includes scaling?", "It prevents data leakage by learning scaling from training data only", "It removes the target", "It makes models slower", "It changes labels", "a"),
 ("What is data drift?", "Input data changes over time, degrading a model", "A bug in Python", "A type of clustering", "Removing duplicates", "a"),
],
"Supervised Learning": [
 ("Linear regression fits the line that minimises...", "The sum of squared errors", "The number of features", "The number of rows", "The correlation only", "a"),
 ("Which technique reduces overfitting in a single decision tree?", "Increasing max_depth without limit", "Limiting max_depth or min_samples_leaf", "Removing the target", "Adding more duplicates", "b"),
 ("What are support vectors in an SVM?", "The points closest to the decision boundary", "All training points", "The test set", "The coefficients", "a"),
 ("Which SVM parameter trades off margin width against misclassification?", "C", "k", "n_jobs", "random_state", "a"),
 ("Why should features be scaled before using an SVM?", "SVMs are distance-based and sensitive to feature scale", "SVMs cannot read numbers otherwise", "It reduces the number of classes", "It is required by Python", "a"),
],
"Model Evaluation": [
 ("Which metric is most important when missing a positive case is very costly?", "Precision", "Recall", "Accuracy", "Specificity only", "b"),
 ("What does stratified k-fold preserve?", "The class proportions in each fold", "The feature order", "The column names", "The file size", "a"),
 ("What does an AUC of 0.5 indicate?", "Perfect classification", "Random guessing", "A broken pipeline", "A regression model", "b"),
 ("Which search method tries every combination of listed hyperparameter values?", "Random search", "Grid search", "Bayesian optimisation", "Gradient descent", "b"),
 ("High training accuracy but low validation accuracy suggests...", "Underfitting", "Overfitting", "A perfect model", "Class balance", "b"),
],
}
