# example-giphy

## Installation

```
$ cd work
$ git clone git@github.com:vflash/example-giphy.git
$ cd example-giphy
```

First of all please ensure that you have Ubuntu Make installed on you computer.
Otherwise run this command to install Ubuntu Make:
```
$ sudo apt install make
```

To install node modules and make first production build in *out* folder run:
```
$ make
```

To set up nginx:
```
$ cp ./configs/nginx-example-giphy ./nginx-example-giphy
```
Edit following line in nginx-example-giphy file:
```
# from
set $site_path /home/{{user}}/site-example-giphy/out/build;
include /home/{{user}}/site-example-giphy/out/build/nginx-example-giphy.inc;

# to (for example)
set $site_path /home/hero/site-example-giphy/out/build;
include /home/hero/site-example-giphy/out/build/nginx-example-giphy.inc;
```
To add nginx config:
```
$ sudo ln -s /home/hero/site-example-giphy/nginx-example-giphy /etc/nginx/sites-enabled/nginx-example-giphy
$ sudo /etc/init.d/nginx restart
```
Add to *hosts* file:
```
127.0.0.1     example-giphy.site
```
- for Linux */etc/hosts*
- for Windows *C:\Windows\System32\drivers\etc\hosts*

## Build
For production build:
```
$ make
```


## Development
Edit following line in nginx-example-giphy file:
```
# from
set $site_path /home/{{user}}/site-example-giphy/out/build;
include /home/{{user}}/site-example-giphy/out/build/nginx-example-giphy.inc;

# to (for example)
set $site_path /home/hero/site-example-giphy;
include /home/hero/site-example-giphy/nginx-example-giphy.inc;
```

To set dev environment and make webpack watch files run:
```
$ make watch
```


