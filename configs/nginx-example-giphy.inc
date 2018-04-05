set $indexHTML /index.html;

#add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

gzip_comp_level 5;
gzip_types text/plain text/xml application/xml application/javascript application/x-javascript  text/javascript text/css  text/json application/json;
charset utf8;
root $site_path/www;

location /index.html {
    add_header Content-Type text/html;
    expires -1;
    alias $site_path/www/index.html;
    ssi on;
}

location /-static/ {
    rewrite ^/-static/[^/]+/(.*)$ /static/$1 last;
}

location /static/ {
    alias $site_path/static/;
    gzip_static on;
}

location /src/ {
    #autoindex on;
    alias $site_path/src/;
}

location / {
    rewrite ^/[^/]+\.[^/]+$ $uri? break;
    rewrite ^/ $indexHTML? last;
    error_page 404 =200 $indexHTML?;
    #log_not_found off;
}

