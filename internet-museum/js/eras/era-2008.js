/**
 * 《404 之前：互联网考古馆》- 2008 深夜论坛
 */

import { museumStore } from '../state.js';
import { audioManager } from '../audio.js';
import { eggsManager } from '../eggs.js';

const INITIAL_POSTS = [
  {
    floor: '1 楼 (楼主)',
    user: '午夜游民',
    rank: '论坛元老',
    avatar: '🕹️',
    time: '2008-08-08 02:14:09',
    content: '最近一连几天，我房间那台联想锋行电脑在凌晨 2:30 会准时自己亮屏，IE浏览器自动弹出一个全黑的页面，地址栏是一串纯数字IP，中间赫然写着一句话：“请不要断开连接，我们正在给你打包回忆”。我拔了网线它竟然还能打开！求教论坛各位大虾，这到底是什么新型木马？',
    signature: '———— 人在江湖漂，哪能不挨刀。★ 本人常驻 QQ群：3849102'
  },
  {
    floor: '2 楼 (沙发)',
    user: '沙发狂魔_小杰',
    rank: '初级水怪',
    avatar: '🥤',
    time: '2008-08-08 02:16:33',
    content: '沙发！前排占座，兜售西瓜瓜子矿泉水~ 楼主你是不是中了灰鸽子远程控制啊？赶紧下个微点主动防御或者卡巴斯基扫一扫！',
    signature: '———— 抢沙发是一种美德，灌水是一种生活态度。'
  },
  {
    floor: '3 楼 (板凳)',
    user: '网吧网管阿强',
    rank: '技术版副',
    avatar: '🔧',
    time: '2008-08-08 02:22:15',
    content: '拔了网线还能打开？那只有一种可能：页面已经被缓存到本地 Temporary Internet Files 了，或者你的 HOSTS 文件被恶意脚本劫持到 127.0.0.1。楼主不妨查看下任务管理器里有没有陌生的 .exe 进程？',
    signature: '———— 遇到问题先重启，不行再重装，还不行换主板。'
  }
];

const MORE_FLOORS = [
  {
    floor: '4 楼',
    user: '失眠的猫咪',
    rank: '中级会员',
    avatar: '🐱',
    time: '2008-08-08 02:45:00',
    content: '楼主淡定，重装系统试试。话说那个打包回忆有点玄乎啊，会不会是哪个暗恋你的黑客妹子写的恶作剧程序？此帖必火，截图留名！',
    signature: '———— 躲在被窝里用诺基亚刷论坛的人。'
  },
  {
    floor: '5 楼',
    user: 'Matrix_08',
    rank: '高级会员',
    avatar: '🕶️',
    time: '2008-08-08 03:12:18',
    content: '不是电脑的问题，是它比你更早上网。其实我们现在浏览的所有网页，在很多年后可能都会消失得一干二净。也许它是来自未来的回信呢？',
    signature: '———— 01001000 01101001'
  }
];

export function initEra2008() {
  const container = document.getElementById('era-2008');
  if (!container) return;

  const floorContainer = document.getElementById('forum-floors-list');
  const btnLoadMore = document.getElementById('btn-forum-load-more');
  const btnUpvote = document.getElementById('btn-forum-upvote');
  const upvoteCountEl = document.getElementById('forum-upvote-count');
  const hotBadge = document.getElementById('forum-hot-badge');
  const replyInput = document.getElementById('forum-reply-input');
  const btnSubmitReply = document.getElementById('btn-forum-submit-reply');
  const ghostCounterEl = document.getElementById('forum-ghost-online');

  // 1. 初始化渲染初始楼层
  let currentLoadedExtra = false;

  function renderFloorItem(post) {
    const floorDiv = document.createElement('div');
    floorDiv.className = 'forum-floor-item';
    floorDiv.innerHTML = `
      <div class="floor-sidebar">
        <div class="user-avatar-badge">${post.avatar}</div>
        <div class="user-name"><strong>${post.user}</strong></div>
        <div class="user-rank">${post.rank}</div>
      </div>
      <div class="floor-main">
        <div class="floor-meta">
          <span class="floor-tag">${post.floor}</span>
          <span class="post-time">发表于 ${post.time}</span>
          <button class="btn-quote-reply" data-floor="${post.floor}" data-user="${post.user}">[引用回复]</button>
        </div>
        <div class="floor-content">${post.content}</div>
        <div class="floor-signature">${post.signature}</div>
      </div>
    `;

    // 绑定引用按钮
    const quoteBtn = floorDiv.querySelector('.btn-quote-reply');
    quoteBtn?.addEventListener('click', () => {
      audioManager.playClick();
      if (replyInput) {
        replyInput.value = `[quote][b]${post.user}[/b] 在 ${post.floor} 说道：\n${post.content.slice(0, 40)}...[/quote]\n` + replyInput.value;
        replyInput.focus();
      }
    });

    return floorDiv;
  }

  function initFloors() {
    if (!floorContainer) return;
    floorContainer.innerHTML = '';
    INITIAL_POSTS.forEach(p => floorContainer.appendChild(renderFloorItem(p)));
  }

  initFloors();

  // 2. 查看更多回复（楼层展开）
  if (btnLoadMore) {
    btnLoadMore.addEventListener('click', () => {
      audioManager.playClick();
      if (!currentLoadedExtra) {
        currentLoadedExtra = true;
        btnLoadMore.textContent = '正在读取楼层数据包...';
        btnLoadMore.disabled = true;

        setTimeout(() => {
          MORE_FLOORS.forEach(p => {
            floorContainer.appendChild(renderFloorItem(p));
          });
          btnLoadMore.textContent = '已展示全部历史楼层';
          eggsManager.showToast('📄 已成功加载全部历史楼层讨论！');
        }, 500);
      }
    });
  }

  // 3. 顶帖功能与 HOT 标识
  let upvotes = museumStore.getState().forumUpvotes || 3;
  if (upvoteCountEl) upvoteCountEl.textContent = String(upvotes);
  if (upvotes >= 5 && hotBadge) hotBadge.classList.remove('hidden');

  if (btnUpvote) {
    btnUpvote.addEventListener('click', () => {
      audioManager.playForumPostSound();
      upvotes++;
      museumStore.update({ forumUpvotes: upvotes });
      if (upvoteCountEl) upvoteCountEl.textContent = String(upvotes);

      // 飘字动画
      showFloatingPlusOne(btnUpvote);

      if (upvotes >= 5 && hotBadge) {
        hotBadge.classList.remove('hidden');
        hotBadge.classList.add('pulse-glow');
      }
    });
  }

  // 4. 回帖交互
  if (btnSubmitReply) {
    btnSubmitReply.addEventListener('click', () => {
      const text = replyInput?.value.trim();
      if (!text) {
        alert('请输入回帖内容（字数不少于15字，严禁纯数字纯表情灌水）');
        return;
      }

      audioManager.playForumPostSound();
      btnSubmitReply.disabled = true;
      btnSubmitReply.textContent = '网络延迟中... 发送中';

      setTimeout(() => {
        const floorNum = floorContainer.children.length + 1;
        const userPost = {
          floor: `${floorNum} 楼`,
          user: '我 (考古学者)',
          rank: '游侠大虾',
          avatar: '🤠',
          time: new Date().toLocaleTimeString(),
          content: text,
          signature: '———— 岁月神偷，我们在 2008 年的深坑里留下了脚印。'
        };
        floorContainer.appendChild(renderFloorItem(userPost));

        // 随机跟帖
        const randomReplies = [
          '楼主淡定，重装系统试试。',
          '此帖必火，前排留名！',
          '我朋友当年也遇到过，后来他成了该站管理员。',
          '十五字十五字十五字十五字。'
        ];
        const botReply = randomReplies[Math.floor(Math.random() * randomReplies.length)];

        setTimeout(() => {
          const botFloorNum = floorContainer.children.length + 1;
          const botPost = {
            floor: `${botFloorNum} 楼`,
            user: '深夜夜猫子',
            rank: '潜水员',
            avatar: '🌙',
            time: new Date().toLocaleTimeString(),
            content: `[quote]回复 ${floorNum} 楼[/quote]\n${botReply}`,
            signature: '———— 夜太美，尽管太危险，总有人黑着眼眶修仙。'
          };
          floorContainer.appendChild(renderFloorItem(botPost));
          eggsManager.showToast('💬 回帖成功！收到论坛网友秒回！');
        }, 700);

        if (replyInput) replyInput.value = '';
        btnSubmitReply.disabled = false;
        btnSubmitReply.textContent = '快速发表回复 ↵';
      }, 800);
    });
  }

  // 5. 彩蛋 3：签名档里跳动的幽灵在线人数
  if (ghostCounterEl) {
    ghostCounterEl.addEventListener('click', () => {
      audioManager.playClick();
      eggsManager.triggerEgg('eternal_online_avatar');
    });
  }
}

function showFloatingPlusOne(targetEl) {
  const plusOne = document.createElement('span');
  plusOne.className = 'floating-plus-one';
  plusOne.textContent = '+1 顶！';
  const rect = targetEl.getBoundingClientRect();
  plusOne.style.left = `${rect.left + rect.width / 2}px`;
  plusOne.style.top = `${rect.top - 10}px`;
  document.body.appendChild(plusOne);

  setTimeout(() => {
    plusOne.remove();
  }, 1000);
}
