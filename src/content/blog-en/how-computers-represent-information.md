---
title: 'How Computers Represent Information'
description: 'Discover how computers transform everything you see—emojis, images, music, and videos—into zeros and ones using binary representation.'
pubDate: 2025-10-23
author: 'QuiverLearn'
tags: ['computer-science', 'binary', 'encoding', 'fundamentals']
category: 'Computer Science'
difficulty: 'beginner'
hasMath: true
hasCode: false
estimatedReadingTime: 12
featured: true
draft: false
language: en
---

What do emojis, music, and video games have in common? They're all made of **zeros and ones**. Computer science isn't just about how to make a program or software available on your phone. It's about **representing information**. Every image, sound, and text you see on a screen consists of binary digits. Let's explore how computers represent them behind the scenes.

## What is Computer Science?

Fun fact: In Indonesia, there are some universities that call computer science 'information technology'. They are basically the same, but do you know why? It's **because they study information**.

Basically, all fields of study are about **problem solving**, including computer science. It's about **problem solving** involving **information** using **computational thinking** to **represent** and **process** that information.

So, **Computer science** is **problem solving** that uses **computational thinking** to **represent** and **process** that information.

## Types of Information We Encounter Daily

How do we represent this information? Before that, what forms of information do we have? Where can we find information in our daily life?

- From a book, television, billboard, pamphlet, phone, internet, radio

What forms of information do they have?

- Text and letters
- Numbers
- Images and Color
- Sound and Video

# How do computers process those types of information?

## Numbers: From Decimal to Binary

Basically, computer hardware **only knows numbers, only 0 and 1**. Why does a computer only understand those two numbers? Because the transistors that make up this hardware only have two states. It's like a switch, on and off. Modern electronic devices, such as Macs, PCs, and phones, utilize millions of microscopic light switches called **transistors** to store information by being turned either on (one) or off (zero).

### Understanding the Decimal System

How do they represent numbers? Like 12345, 1 million.
Numbers that we know like 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, etc., are called the decimal system, base 10: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9

Every single number can be represented as $$a_n+10^n+a_{n-1}+10^{n-1}+\cdots+a_1 \cdot 10^1+ a_0$$
Example $$1234 = 1 \cdot 10^3 + 2 \cdot 10^2 + 3 \cdot 10^1 +4$$

### Converting to Binary

Because computers only know $0$ and $1$, we must represent all of those numbers in the binary system (base 2). How do we represent 11 as binary?

- 11 ÷ 2 = 5 remainder 1  ← rightmost bit
- 5 ÷ 2 = 2 remainder 1
- 2 ÷ 2 = 1 remainder 0
- 1 ÷ 2 = 0 remainder 1  ← leftmost bit

Based on that, we can get $$11=1\cdot 2^3+0\cdot 2^2+1\cdot 2^1+1=1011$$So $11$ will be read as $1011$ on a computer

### Try It Yourself

Try it yourself to convert 23 into binary:

- 23 ÷ 2 = 11 remainder 1  ← rightmost bit
- 11 ÷ 2 = 5 remainder 1
- 5 ÷ 2 = 2 remainder 1
- 2 ÷ 2 = 1 remainder 0
- 1 ÷ 2 = 0 remainder 1  ← leftmost bit

So $23$ will be read as $10111$

## Text: ASCII and Unicode

Now we move on to **Text and Letters**. How about it? Yes, we represent it as numbers.

### ASCII - The Foundation

- Alphabetical and standard symbols in English are represented as ASCII. It is the **American Standard Code for Information Interchange (ASCII)**. ASCII typically uses 7 bits (0-127), and the usual ASCII that we use is the extended version: 8 bits (0-255) that can represent about 256 characters, sufficient for English.

### Unicode - Global Characters

- How about **other human languages**? There are some languages that have accented characters and many symbols, especially in Asia. These are represented as **Unicode**. Unicode is a superset of ASCII and uses more bits (16, 24, or 32 bits) to allow for up to 4 billion possible characters. This assigns each character a unique number called a "code point".

- Examples of code points:
	•	'A' = U+0041
	•	'你' (Chinese) = U+4F60
	•	'😀' (emoji) = U+1F600

## Images: Pixels and Colors

How do computers display an emoji and images?

Emojis and images consist of several colors that represent them. Did you ever see people make an image from Lego bricks? The idea to represent those images is similar to how we represent images on the screen. We can represent the images using **pixels**, which are single dots on the screen. Those pixels are represented by our primary colors.

### Understanding Color Mixing

Did you ever play with mixing color paint as a child? The idea is still the same, but actually there are differences. Mixing paint is about pigments (subtractive color—mixing all colors makes black). In computers, it's about light (additive color—mixing Red, Green, and Blue light makes white).

### RGB Color System

In computers, the color is defined by Red, Green, and Blue. Each color has an intensity that we can define from 0 to 255. If we increase the number, the color will be brighter. Examples:

- $(255, 0, 0) =$ pure red
- $(255, 255, 255) =$ white (all lights on)
- $(0, 0, 0) =$ black (all lights off)

Large photographs require millions of bytes because of the high number of pixels.

## Video and Sound

How about Video and Sound?

### Video: Sequences of Images

Videos can be represented as a sequence of images that play at a fast speed. Did you ever see a cartoonist draw images in the corner of books, and then open the book quickly? It makes the images move like a video.

### Sound: Digital Sampling

Sound is different—it's a continuous wave signal. To digitize it:

1. A microphone **samples** the wave thousands of times per second
2. Each sample measures the wave's amplitude (loudness) at that instant
3. These measurements become bytes stored in audio files

CD-quality audio samples at **44,100 times per second** (44.1 kHz). Higher sample rates = better quality but larger files.

## Context: How Computers Know What's What

It depends on the context, similar to words. In Software Engineering, "staging" means a deployment phase. In Data Engineering, it's about a layering phase. Computers can differentiate how to transform data depending on the context we provide.

### File Formats as Context

What is the representation of context in computers? It lies in the file format. We have `.JPEG` for images, `.txt` for text. This format represents context as special bytes called a header. This header tells the computer that the next million bytes are image data so the computer can decode them as pixels, or that the next bytes are ASCII text.

So, the power of the programmer lies in writing code that tells the computer how to treat these patterns—whether to store a number, a letter, a color, or something else.

## Conclusion

Finally, we understand that every app, website, film, and game is built on binary data that is converted by computer hardware to represent real-world information.

### Key Takeaways

- Computers use **binary (0 and 1)** because transistors have two states
- **Numbers** are converted from decimal to binary using division
- **Text** is encoded using ASCII (English) or Unicode (global languages)
- **Images** are made of pixels, each with RGB color values (0-255)
- **Video** is a sequence of images played rapidly
- **Sound** is digitized by sampling continuous wave signals
- **File formats** provide context through headers

Understanding how computers represent information is fundamental to computer science. This knowledge helps you appreciate the digital world around you and forms the foundation for deeper programming and system design concepts.

---

**Next in this series**: *Introduction to Algorithms and Problem Solving*
