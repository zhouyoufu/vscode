# vscode-issue-helper

> Vue issue helper

This is deployed at https://vscode-perf-issue.surge.sh.
In the future, we can have Cmd + Shift + P -> Open Perf Issue leading to this page with all relevant info collected by VS Code, filled in as query parameters.

Here is one example:

https://vscode-perf-issue.surge.sh/?vscode=code-oss-dev%201.19.0%20%28Commit%20unknown,%20Date%20unknown%29&os=Darwin%20x64%2016.7.0&cpu=Intel%28R%29%20Core%28TM%29%20i7-7820HQ%20CPU%20%40%202.90GHz%20%288%20x%202900%29&sysMemory=16.00GB%20%280.21GB%20free%29&procMemory=169.31MB%20working%20set%20%280.00MB%20peak,%20130.89MB%20private,%20116.34MB%20shared%29&avgLoad=2,%202,%202&vm=0%25&startup=no&screenReader=no&emptyWorkspace=yes

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).
