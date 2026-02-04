---
title: VNCTF2026出题笔记
date: 2026-02-04
tags: [CTF, 逆向工程, 安全]
category: 技术分享
author_id: 1
author_name: 博主
---

# VNCTF2026出题笔记

很高兴在 VNCTF2026 与大家见面，希望大家都能够玩的开心，有所收获！

Ciao~ >w<)/

## 1. delicious obf

打开程序后根据提示字符串定位到主要函数，根据函数命名含数：

```c
void sub_140006818() {
    char input[6];
    printf("Call0\n");
    memset(input, 0, sizeof(input));
    printf("Call1\n");
    scanf("%s", input);
    printf("Call2\n");
    if (strcmp(input, "flag") == 0) {
        printf("Call3\n");
        printf("flag{Hello}");
    }
}
```

### 1.1 混淆分析

程序中存在大量的混淆代码，主要包括以下几种类型：

1. **控制流混淆**：使用复杂的条件分支和跳转指令
2. **数据混淆**：对关键数据进行加密和变换
3. **函数混淆**：使用随机命名的函数和变量

### 1.2 变量分析

通过动态调试，我们可以发现程序中使用了以下关键变量：

- `input`：用户输入的字符串
- `key`：用于加密的密钥
- `encrypted_flag`：加密后的 flag 数据

## 2. ez_maze

这是一个简单的迷宫游戏，玩家需要控制角色从起点走到终点。

### 2.1 迷宫分析

迷宫的布局如下：

```
S X X X X
. . . X X
X X . X X
X . . . E
X X X X X
```

其中：
- `S` 是起点
- `E` 是终点
- `.` 是可通行的路径
- `X` 是障碍物

### 2.2 解题思路

1. 分析迷宫的布局
2. 找到从起点到终点的最短路径
3. 根据路径生成正确的移动序列

## 3. reverse_me

这是一个逆向工程题目，需要分析程序的逻辑并找到正确的输入。

### 3.1 程序分析

程序的主要逻辑如下：

1. 读取用户输入
2. 对输入进行一系列变换
3. 与预设的目标值进行比较
4. 如果匹配则输出 flag

### 3.2 关键算法

```python
def transform(input_str):
    result = []
    for i, c in enumerate(input_str):
        transformed = (ord(c) ^ (i + 0x10)) + 0x20
        result.append(chr(transformed))
    return ''.join(result)
```

### 3.3 解题过程

1. 分析程序的变换算法
2. 逆向变换过程
3. 计算出正确的输入

## 4. pwn_me

这是一个缓冲区溢出题目，需要利用漏洞获取 shell。

### 4.1 漏洞分析

程序中存在以下漏洞：

- 缓冲区溢出：输入长度没有限制
- 栈溢出：可以覆盖返回地址

### 4.2 利用思路

1. 确定缓冲区的大小
2. 构造 payload，包含 shellcode
3. 覆盖返回地址到 shellcode
4. 触发漏洞获取 shell

## 5. web_challenge

这是一个 web 安全题目，需要利用网站的漏洞获取 flag。

### 5.1 漏洞分析

网站中存在以下漏洞：

- SQL 注入：用户输入没有过滤
- 跨站脚本：可以注入恶意脚本
- 文件上传：可以上传恶意文件

### 5.2 利用过程

1. 发现 SQL 注入漏洞
2. 构造注入语句获取数据库信息
3. 找到存储 flag 的表
4. 提取 flag

## 6. crypto_challenge

这是一个密码学题目，需要破解加密算法获取 flag。

### 6.1 算法分析

使用的加密算法如下：

```python
def encrypt(plaintext, key):
    ciphertext = []
    for i, c in enumerate(plaintext):
        encrypted = (ord(c) + key[i % len(key)]) % 256
        ciphertext.append(encrypted)
    return bytes(ciphertext)
```

### 6.2 破解思路

1. 分析加密算法的弱点
2. 利用已知明文攻击
3. 恢复密钥
4. 解密获取 flag

## 7. misc_challenge

这是一个杂项题目，需要通过各种手段获取 flag。

### 7.1 题目分析

题目提供了一个压缩文件，包含以下内容：

- 图片文件
- 音频文件
- 文本文件

### 7.2 解题步骤

1. 分析压缩文件的结构
2. 提取隐藏的信息
3. 组合信息获取 flag

## 8. 总结

VNCTF2026 是一次非常成功的比赛，感谢所有参与者和组织者的努力。通过这次比赛，我们不仅学习了各种安全技术，还结交了许多志同道合的朋友。

希望在未来的比赛中，我们能够继续一起学习、一起进步，共同推动网络安全技术的发展。

### 8.1 技术收获

- 逆向工程：学习了各种混淆技术的分析方法
- 漏洞利用：掌握了缓冲区溢出的利用技巧
- 密码学：了解了常见加密算法的原理和破解方法
- Web 安全：熟悉了常见 Web 漏洞的发现和利用

### 8.2 未来展望

在未来的比赛中，我们应该：

1. 加强团队合作，发挥各自的优势
2. 持续学习新技术，保持技术敏感度
3. 注重基础知识的学习，打牢基础
4. 培养创新思维，尝试新的解题方法

## 9. 附录

### 9.1 工具推荐

- **IDA Pro**：专业的逆向工程工具
- **Ghidra**：开源的逆向工程工具
- **pwntools**：漏洞利用工具库
- **sqlmap**：SQL 注入检测工具
- **Burp Suite**：Web 安全测试工具

### 9.2 参考资料

1. 《逆向工程权威指南》
2. 《漏洞利用艺术》
3. 《密码学原理与实践》
4. 《Web 应用安全权威指南》
5. 《CTF 实战指南》

### 9.3 联系方式

- GitHub: [https://github.com/yourusername](https://github.com/yourusername)
- Twitter: [https://twitter.com/yourusername](https://twitter.com/yourusername)
- Blog: [https://yourblog.com](https://yourblog.com)

---

希望这篇笔记能够对大家有所帮助，祝大家在未来的比赛中取得好成绩！

Ciao~ >w<)/