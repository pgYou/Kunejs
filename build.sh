tsc
cp ./packages/kuneServer/package.json ./dist/kuneServer/package.json
cp ./packages/kune/package.json ./dist/kune/package.json

cd ./dist/kune && npm link
cd ../kuneServer && npm link