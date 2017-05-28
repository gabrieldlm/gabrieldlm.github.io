---
layout: post
comments: true
title: Quick and Dirty News Checker
categories: rnn neural-network 
---

In the past weeks I’ve read [about fake news and plans to prevent them]( https://www.theguardian.c  om/technology/2016/dec/15/facebook-flag-fake-news-fact-check).  Without entering in the debate about the freedom of speech, I decided to see what can be done in a couple of hours, and it seemed a good excuse to spend some cents on Amazon’s EC2.


_DISCLAIMER: this is not a validy scientific-ish post or model_


I went directly to Kaggle to see if they had something usefull. After a couple of minutes, I found [this]( https://www.kaggle.com/rootuser/worldnews-on-reddit) and [this]( https://www.kaggle.com/mrisdal/fake-news). The Reddit database only contained the title, and inspired by my personal experince that people almost always reed only the title, decided to use only the news title.


Since I barely laid my eyes on the news, and seeing that the “fake” news had various classifications, the classifier will tell us if the news are suspicious or not. After correcting the erros pointed by pandas, the Frankenstein function the “preprocessing” was finnished. It turns out that the dataset is very unbalanced, with much more “genuine” news than suspicius ones, even after justin selecting news after June of 2016. Another consideration is that tf-idf was not used, for this toy classifier I thought that just using the number of times that the word appered was enought.

The design of the network was very basic, and it took more time running the Frankenstein than compiling and training the network. The result was the fallowing


![alt text]( https://raw.githubusercontent.com/gabrieldlm/gabrieldlm.github.io/master/images/quick-dirty/news_check_res.png)


The result was better than a dummy classifier ( saying that all the news where “genuine” would have an accuracy of 0.78). So, with a couple hours of careless programming, a crappy dataset and some cents, an accuracy of near 90% was achived. I’m pretty much sure that the guys on facebook would achive MNIST’s results for this job.

 
