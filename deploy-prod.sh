ssh dosetap-production -t 'cd api.dosetap.com;git reset --hard;git checkout main;git pull; npm i;npm run migrate;pm2 reload 0'