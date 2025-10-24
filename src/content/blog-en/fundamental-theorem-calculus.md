---
title: 'The Fundamental Theorem of Calculus'
description: 'An intuitive explanation of the Fundamental Theorem of Calculus and why it connects differentiation and integration.'
pubDate: 2025-10-12
author: 'QuiverLearn'
tags: ['calculus', 'mathematics', 'integration', 'differentiation']
category: 'Calculus'
difficulty: 'intermediate'
hasMath: true
hasCode: true
estimatedReadingTime: 10
featured: true
draft: false
language: en
---

The **Fundamental Theorem of Calculus** (FTC) is one of the most important theorems in mathematics. It establishes a profound connection between two central operations in calculus: differentiation and integration.

## What is the Fundamental Theorem of Calculus?

The theorem has two parts, both of which reveal the inverse relationship between derivatives and integrals.

### Part 1: The Integral Function

If $f$ is continuous on $[a, b]$, then the function $F$ defined by:

$$F(x) = \int_a^x f(t) \, dt$$

is continuous on $[a, b]$, differentiable on $(a, b)$, and:

$$F'(x) = f(x)$$

This tells us that **integration and differentiation are inverse operations**.

### Part 2: The Evaluation Theorem

If $f$ is continuous on $[a, b]$ and $F$ is any antiderivative of $f$, then:

$$\int_a^b f(x) \, dx = F(b) - F(a)$$

This gives us a practical way to compute definite integrals!

## An Intuitive Example

Let's say we want to find the area under the curve $f(x) = x^2$ from $x = 0$ to $x = 2$.

### Step 1: Find the antiderivative

The antiderivative of $f(x) = x^2$ is:

$$F(x) = \frac{x^3}{3} + C$$

### Step 2: Apply the FTC (Part 2)

$$\int_0^2 x^2 \, dx = F(2) - F(0) = \frac{2^3}{3} - \frac{0^3}{3} = \frac{8}{3}$$

So the area is $\frac{8}{3}$ square units!

## Why Does This Work?

The key insight is that if we accumulate tiny areas under a curve (integration), the rate at which that accumulated area changes (differentiation) is exactly the height of the curve at that point.

Think of it like this:
- **Integration** = Accumulation of area
- **Differentiation** = Rate of change of that accumulation

## Computing It in Code

Here's how we might verify this numerically using Python:

```python
import numpy as np
from scipy import integrate

# Define our function
def f(x):
    return x**2

# Numerical integration
result, error = integrate.quad(f, 0, 2)
print(f"Numerical integral: {result:.6f}")

# Analytical result using FTC
analytical = (2**3)/3 - (0**3)/3
print(f"Analytical (FTC): {analytical:.6f}")

# Verify they match
print(f"Difference: {abs(result - analytical):.10f}")
```

Output:
```
Numerical integral: 2.666667
Analytical (FTC): 2.666667
Difference: 0.0000000000
```

## Applications

The FTC is used everywhere in mathematics, physics, and engineering:

1. **Physics**: Computing work from force: $W = \int_a^b F(x) \, dx$
2. **Probability**: Finding probabilities from density functions
3. **Economics**: Calculating total cost from marginal cost
4. **Engineering**: Determining displacement from velocity

## Practice Problems

Try these exercises to test your understanding:

1. Evaluate: $\int_1^3 (2x + 1) \, dx$

   **Solution**:
   $$F(x) = x^2 + x$$
   $$F(3) - F(1) = (9 + 3) - (1 + 1) = 10$$

2. If $g(x) = \int_0^x \sin(t) \, dt$, find $g'(x)$.

   **Solution**: By FTC Part 1, $g'(x) = \sin(x)$

3. Evaluate: $\int_0^\pi \cos(x) \, dx$

   **Solution**:
   $$F(x) = \sin(x)$$
   $$F(\pi) - F(0) = \sin(\pi) - \sin(0) = 0 - 0 = 0$$

## Conclusion

The Fundamental Theorem of Calculus bridges the gap between the tangent line problem (derivatives) and the area problem (integrals). It's the key that unlocks the power of calculus and makes it useful for solving real-world problems.

Understanding the FTC deeply will help you:
- Compute integrals efficiently
- Understand the relationship between rates and accumulation
- Apply calculus to physics and engineering problems

Keep practicing, and these concepts will become second nature!

---

**Next in this series**: *Integration Techniques: Substitution and Parts*
