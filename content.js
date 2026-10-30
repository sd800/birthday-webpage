/*
 * 生日祝福与信件内容：修改这里，保存后刷新网页即可。
 * recipient / sender：收信人与署名。
 * letterParagraphs：每个带引号的项目是一段正文；可自由增加段落。
 * extraWishes：可增加额外祝福语。
 * 信件中可使用 {recipient}、{sender}，网页会自动替换。
 * 英文字母有笔画动画，其他文字自动使用正常字体。
 */
    const BIRTHDAY = {
      recipient: "My Babe",
      sender: "your love",
      greeting: "Happy Birthday",       // 显示为：Happy Birthday My Babe!
      punctuation: "!",
      fromLabel: "From:",
      extraWishes: [],                   // 可加入更多祝福，例如 ["Always, and forever."]
      letterSalutation: "To {recipient},",
      letterParagraphs: [
        "生日快乐，我最亲爱的你。",
        "想把这一刻的星光和温柔，都悄悄装进这封信里，送给今天的你。谢谢你的出现，让许多原本平凡的日子，都有了值得珍藏的意义。",
        "愿新的一岁，你依然有做梦的勇气，也有慢慢来时的从容。愿你被爱包围，被生活温柔以待；愿那些认真许下的心愿，都在某一天开出花来。",
        "而我想做的，是陪你看更多风景，听你说更多心事，和你一起，把每一个小小的日常，过成我们喜欢的模样。",
        "今天的快乐属于你，往后的每一天，我也想陪你一起。"
      ],
      letterClosing: "With all my love,",
      animation: {
        rotationSpeed: 0.075,            // 蛋糕每秒旋转的弧度；0 为停止旋转
        handwritingSeconds: 4.8,
        stars: 245                      // 星光数量；手机端会自动适度减少
      }
    };
