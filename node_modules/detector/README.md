
# detector

根据 UserAgent 字符串识别客户端信息的模块。识别的信息包括：

1. 硬件设备。
2. 操作系统。
3. 浏览器。
4. 浏览器渲染引擎。

识别到的信息结构如下：

```js
detector = {
    device: {
        name: "iphone",
        version: -1,
        fullVersion: "-1",
        [iphone]: -1
    },
    os: {
        name: "ios",
        version: 6.1,
        fullVersion: "6.1",
        [ios]: 6.1
    },
    browser: {
        name: "chrome":
        version: 26.0,
        fullVersion: "26.0.1410.50",
        mode: 26.0,
        fullMode: "26.0.1410.50",
        compatible: false,
        [chrome]: 26.0
    },
    engine: {
        name: "webkit",
        version: 536.26,
        fullVersion: "536.26",
        mode: 523.26,
        fullMode: "523.26",
        compatible: false,
        [webkit]: 536.26
    }
}
```

备注：上面的 [iphone], [ios], [chrome], [webkit] 是动态的，根据实际识别 到的信息不同而有所不同。


detector 是根据 UserAgent 信息识别客户端的模块，可以用于在服务端处理 UserAgent
识别客户端。

该版本适合运行在 Node 环境中处理服务端收集到的 userAgent 信息。

浏览器端运行的版本推荐 [detector](https://github.com/aralejs/detector)。

## 使用说明

```js
var detector = require("detector");
var ua = req.headers['user-agent'];
console.log(detector.parse(ua));
```

## API

### {Object} detector.parse(String userAgent)

根据指定 userAgent 识别客户端信息。
