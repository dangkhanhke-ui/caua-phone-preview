/* Cauã timeline: Mother's Day, May 11 2014, 21:28.
   Image and family avatars are intentionally upload-ready placeholders. */
(() => {
  'use strict';
  const data=window.__CAUA_FACEBOOK_DATA__;
  if(!data||!Array.isArray(data.PROFILE_POSTS))return;
  const post={
    id:'cp201405112128',
    dateISO:'2014-05-11',year:'2014',timestamp:'11/05/2014 · 21:28',
    author:'Cauã Valença',context:'',
    text:'Chúc mừng Ngày của Mẹ tới người phụ nữ tuyệt vời luôn ở bên con, ngay cả những lúc con không xứng đáng. Cảm ơn mẹ vì tất cả những gì mẹ đã và vẫn đang làm cho con. Con yêu mẹ nhiều lắm ❤️❤️❤️',
    media:'placeholder',mediaRatio:'landscape',
    likes:'254',commentCount:'28',shareCount:'',liked:false,
    comments:[
      {name:'Tânia Valença',text:'Chúc mừng Ngày của Mẹ nha hai mẹ con, rảnh rỗi dắt mẹ về quê chơi với dì! ❤️🙏',replies:[
        {name:'Cauã Valença',text:'Dạ con cảm ơn dì, con cũng chúc dì nha'}
      ]},
      {name:'Tio Marcelo',text:'Làm thằng đàn ông là phải biết thương mẹ như vậy! Giỏi lắm cháu.',replies:[]},
      {name:'Raquel Martins',text:'Chúc cô @Clarice Valença ngày của Mẹ luôn vui vẻ hạnh phúc ạ 🥰💐',replies:[]}
    ]
  };
  if(data.PROFILE_POSTS.some(item=>item.id===post.id))return;
  const at=data.PROFILE_POSTS.findIndex(item=>item.dateISO<post.dateISO);
  data.PROFILE_POSTS.splice(at<0?data.PROFILE_POSTS.length:at,0,post);
})();
