---
title: "why does the golden ratio look so good? the math behind phi"
summary: "where the golden ratio comes from, why it keeps showing up in squares, pentagons, fibonacci numbers and sunflowers, and what we can honestly say about its beauty."
date: "2026-11-23"
category: "mathematics"
tags: ["golden ratio", "fibonacci", "geometry", "number theory"]
status: "published"
author: "sage"
span: 2
offset: 0
cover:
  bg: "sage"
  shapes: ["blue-large", "red-small"]
  image: /covers/math-behind-phi.jpeg 
links:
  - label: "wikipedia"
    href: "https://en.wikipedia.org/wiki/Golden_ratio"
---

## summary

You have probably heard that the golden ratio is the most beautiful number. Some of that is hype. Some of it is real, and the real part is more interesting than the hype. This article goes through the actual math: where the number comes from, why it keeps turning up, and what we can fairly say about beauty.

> A number can be special without being magic. The golden ratio is special because of what it does inside equations, not because of what it does to your eyes.

## where the number comes from

Take a line and cut it into a long piece $a$ and a short piece $b$. The cut is called golden when the whole line compared to the long piece is the same as the long piece compared to the short one:

$$
\frac{a+b}{a} = \frac{a}{b} = \varphi
$$

Set $b = 1$ and call the long piece $x$. Then the rule becomes $\frac{x+1}{x} = x$, which rearranges to

$$
x^2 = x + 1 \quad\Longrightarrow\quad x^2 - x - 1 = 0
$$

The quadratic formula finishes the job:

$$
x = \frac{1 \pm \sqrt{5}}{2}
$$

The positive root is the golden ratio:

$$
\varphi = \frac{1 + \sqrt{5}}{2} \approx 1.6180339887
$$

The other root is $\psi = \frac{1 - \sqrt{5}}{2} \approx -0.618$. We will need it later. It is also equal to $-1/\varphi$.

### three odd facts

Because $\varphi^2 = \varphi + 1$, a few strange things follow almost for free.

- Squaring $\varphi$ is the same as adding 1 to it. No other positive number does that.
- Divide both sides of $x^2 = x + 1$ by $x$ and you get $x = 1 + \frac{1}{x}$. So $\frac{1}{\varphi} = \varphi - 1 \approx 0.618$. The reciprocal has the same decimals as the number itself.
- Multiply $\varphi^2 = \varphi + 1$ by $\varphi^{n-2}$ and you get $\varphi^n = \varphi^{n-1} + \varphi^{n-2}$. Every power of $\varphi$ is the sum of the two powers before it.

### the number that feeds on itself

Start from $x = 1 + \frac{1}{x}$ and plug the right side into itself again and again:

$$
\varphi = 1 + \cfrac{1}{1 + \cfrac{1}{1 + \cfrac{1}{1 + \cdots}}}
$$

Do the same with $x = \sqrt{1 + x}$ and you get a stack of square roots:

$$
\varphi = \sqrt{1 + \sqrt{1 + \sqrt{1 + \cdots}}}
$$

Notice that the fraction is made of nothing but ones. That is the simplest continued fraction there is, and it matters a lot in the section on sunflowers.

## the golden rectangle

Draw a rectangle with sides $1$ and $\varphi$. Cut off a $1 \times 1$ square. What is left has sides $\varphi - 1$ and $1$, which is the same as $\frac{1}{\varphi}$ and $1$. Its long side over its short side is $\varphi$ again.

So the leftover piece is the same shape as the whole thing, only smaller by a factor of $\frac{1}{\varphi}$. You can cut off a square from that one too, and keep going forever.

![a golden rectangle cut into squares, with a spiral drawn through them](/svgs/golden-ratio-rectangle.svg "figure 1: each cut leaves a smaller golden rectangle | center")

Draw a quarter circle inside each square and the arcs join into a spiral. Strictly speaking this is only close to the real golden spiral, which is a logarithmic spiral that grows by a factor of $\varphi$ every quarter turn:

$$
r = a \, e^{b\theta}, \qquad b = \frac{2 \ln \varphi}{\pi} \approx 0.306
$$

## the fibonacci connection

The Fibonacci numbers start $1, 1, 2, 3, 5, 8, 13, \dots$ and each one is the sum of the two before it:

$$
F_{n+1} = F_n + F_{n-1}
$$

That is the same rule that powers of $\varphi$ follow, and it is not an accident. Divide each Fibonacci number by the one before it and the answers settle down fast:

| n  | F(n+1) / F(n) | distance from φ |
| -- | ------------- | --------------- |
| 1  | 1.0000        | -0.6180         |
| 2  | 2.0000        | +0.3820         |
| 3  | 1.5000        | -0.1180         |
| 4  | 1.6667        | +0.0486         |
| 5  | 1.6000        | -0.0180         |
| 6  | 1.6250        | +0.0070         |
| 7  | 1.6154        | -0.0026         |
| 8  | 1.6190        | +0.0010         |

![ratios of neighbouring fibonacci numbers zigzagging toward the golden ratio](/svgs/golden-ratio-fibonacci.svg "figure 2: the ratios jump above and below φ, getting closer every step | center")

There is an exact formula for the $n$-th Fibonacci number, named after Binet:

$$
F_n = \frac{\varphi^n - \psi^n}{\sqrt{5}}
$$

Since $|\psi| < 1$, the term $\psi^n$ shrinks to almost nothing, so $F_n \approx \varphi^n / \sqrt{5}$. That is why the ratio of neighbours heads to $\varphi$. The error also flips sign each step, because $\psi$ is negative, and it shrinks by about $\varphi^2 \approx 2.618$ every time. You can see that zigzag in the chart.

If you want to check it yourself, this takes a few lines:

```python
a, b = 1, 1
for n in range(1, 13):
    a, b = b, a + b
    print(n, b / a)
```

## the pentagon

Take a regular pentagon with side length 1 and draw its diagonals. Each diagonal is exactly $\varphi$ times as long as a side.

![a regular pentagon with one diagonal and one side highlighted](/svgs/golden-ratio-pentagon.svg "figure 3: diagonal over side is exactly φ | center")

Here is a short proof. Pick four neighbouring corners $A, B, C, D$. They sit on a circle, so Ptolemy's theorem applies:

$$
AC \cdot BD = AB \cdot CD + BC \cdot AD
$$

Call the diagonal length $d$. Then $AC = BD = d$, the three sides are $1$, and $AD$ is also a diagonal. So

$$
d \cdot d = 1 \cdot 1 + 1 \cdot d \quad\Longrightarrow\quad d^2 = d + 1
$$

That is the golden equation again, so $d = \varphi$.

## why plants seem to use it

Here is where the "most irrational number" idea comes in. Some irrational numbers are easy to approximate with fractions. $\pi$ is one, since $\frac{22}{7}$ is already close. The golden ratio is the opposite. Its continued fraction is all ones, which makes it the hardest number to approximate. A theorem by Hurwitz says that for any irrational $\alpha$ there are infinitely many fractions with

$$
\left| \alpha - \frac{p}{q} \right| < \frac{1}{\sqrt{5}\, q^2}
$$

and that the constant $\sqrt{5}$ cannot be improved. The golden ratio is the number that makes that bound tight.

Why does this matter for a sunflower? A plant adds new seeds one at a time, each turned by a fixed angle from the last. If that angle is a simple fraction of a full turn, like a quarter, the seeds line up in spokes and leave gaps. If the angle is as far from every fraction as possible, the seeds pack evenly. That angle is the golden angle:

$$
\text{golden angle} = \frac{360^\circ}{\varphi^2} \approx 137.5^\circ
$$

<!-- grid -->

![seeds placed with a turn of 137.5 degrees fill the disc evenly](/svgs/golden-ratio-seeds-golden.svg "137.5° turn, even packing | left")
![seeds placed with a turn of 90 degrees fall into four spokes](/svgs/golden-ratio-seeds-quarter.svg "90° turn, four wasted spokes | right")

<!-- /grid -->

Count the spirals in a real sunflower head and you often get two neighbouring Fibonacci numbers, like 34 and 55. The plant is not doing math. The growth process just settles into the pattern that wastes the least space. Many plants do not follow it at all, so treat it as a common pattern, not a law.

## is it actually pretty?

This is the part where the story gets shakier. Experiments on rectangle preferences go back to the 1860s, and the first results suggested people liked rectangles close to golden. Later studies were mixed. People tend to like a range of proportions, and $\varphi$ is not a clear winner inside that range.

Some famous claims also fall apart when you look at them. There is no solid evidence that the Parthenon was designed around $\varphi$, and the numbers only fit if you choose which parts to measure. Body proportions vary a lot between people, so "the golden ratio is in the human body" is mostly a matter of picking the right measurements.

Here is a quick scorecard:

| where people say φ appears | verdict                                  |
| -------------------------- | ---------------------------------------- |
| pentagon diagonals         | exact, and provable                      |
| fibonacci ratios           | exact limit                              |
| sunflower seed angle       | very close, caused by growth and packing |
| the parthenon              | no good evidence                         |
| human faces and bodies     | loose at best                            |

So why does it still feel pretty? My honest guess is that the beauty is in the math, not in the eyes. One tiny equation, $x^2 = x + 1$, gives you a self-similar rectangle, a number sequence, a pentagon and a packing rule. When a single idea explains that many unrelated things, it feels right, and that feeling is easy to mistake for visual beauty.

### try it yourself

- [x] solve $x^2 = x + 1$ by hand
- [ ] run the python snippet and watch the ratios settle
- [ ] draw a golden rectangle and cut off five squares
- [ ] plot seeds at $n \times 137.5^\circ$ and then at $n \times 137^\circ$, and compare

---

## notes

The symbol $\varphi$ is the lowercase Greek letter phi. Some books use a capital $\Phi$ for $\frac{1}{\varphi} \approx 0.618$, so check which convention a source uses before comparing numbers.
