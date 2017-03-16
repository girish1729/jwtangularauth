JWT Angular authentication and payload construction
===========================================

This project does d3 rendering of time series data
(double precision float)
with Angular.js factory and nvd3 rendering using JSON
 from a HTTP express server fetching samples from postgres DB.

Overview
========

Using a simple Angular.js module we figure out how to 
use jwt for authentication for both web and other purposes.


Populate DB
===========


Here is how you populate it.
```
psql -U postgres
psql> create database jwtuser;
psql> \c d3samples;
psql> create table jwtmap(id serial,user text, pass text);
psql>quit
```

Screenshots
===========

![s](https://cloud.githubusercontent.com/assets/6890469/23995007/897d4328-0a6d-11e7-9a03-86cc6df6f78d.jpg)


Contact
=======

Girish Venkatachalam <girish@gayatri-hitech.com>
