rm -rf .deploy
mkdir .deploy
cp CNAME .deploy/CNAME
cp robots.txt .deploy/robots.txt
cp index.html .deploy/index.html
cp -R dist .deploy/
cd .deploy
surge .