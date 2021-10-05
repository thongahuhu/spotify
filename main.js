/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / pause / progress
 * 4. CD rotate
 * 5. Next / prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10.Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'PLAYER';

//Declare common variables
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playingButton = $('.player');
const playButton = $('.btn-toggle-play');
const progress = $('#progress');
const nextButton = $('.btn-next');
const prevButton = $('.btn-prev');
const randomButton = $('.btn-random');
const repeatButton = $('.btn-repeat');
const playList = $('.playlist');

//App's operation
const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: 'Industry Baby',
      singer: 'Lil Nas X ft. Jack Harlow',
      path: './assets/music/song1.mp3',
      image: './assets/img/song1.jpg',
    },
    {
      name: 'Whats Popping',
      singer: 'Jack Harlow',
      path: './assets/music/song2.mp3',
      image: './assets/img/song2.jpg',
    },
    {
      name: 'Sicko Mode',
      singer: 'Travis Scott',
      path: './assets/music/song3.mp3',
      image: './assets/img/song3.jpg',
    },
    {
      name: 'Bad and Boujee',
      singer: 'Migos ft. Lil Uzi Vert',
      path: './assets/music/song4.mp3',
      image: './assets/img/song4.jpg',
    },
    {
      name: 'Tyler Herro',
      singer: 'Jack Harlow',
      path: './assets/music/song5.mp3',
      image: './assets/img/song5.jpg',
    },
    {
      name: 'Blueberry Faygo',
      singer: 'Lil Mosey',
      path: './assets/music/song6.mp3',
      image: './assets/img/song6.jpg',
    },
    {
      name: 'Highest In The Room',
      singer: 'Travis Scott',
      path: './assets/music/song7.mp3',
      image: './assets/img/song7.jpg',
    },
    {
      name: 'Plain Jane',
      singer: 'A$AP Ferg ft. Nicki Minaj',
      path: './assets/music/song8.mp3',
      image: './assets/img/song8.jpg',
    },
    {
      name: 'Up ',
      singer: 'Cardi B',
      path: './assets/music/song9.mp3',
      image: './assets/img/song9.jpg',
    },
    {
      name: 'Montero',
      singer: 'Lil Nas X',
      path: './assets/music/song10.mp3',
      image: './assets/img/song10.jpg',
    },
  ],
  setConfig: function(key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config)) || {}
  },
  render: function() {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
          <div class="thumb" style="background-image: url('${song.image}')">
          </div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
          </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>
      `
    })
    playList.innerHTML = htmls.join(''); 
  },
  defineProperties: function() {
    Object.defineProperty(this, 'currentSong', {
      get: function() {
        return this.songs[this.currentIndex];
      }
    })
  },
  handleEvents: function() {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    //CD's rotation
    const cdThumbAnimation = cdThumb.animate([
      {transform: 'rotate(360deg)'}
    ], {
      duration: 10000,
      iterations: Infinity
    })
    cdThumbAnimation.pause();

    //Scroll top
    document.onscroll = function() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    //Play & Pause event
    playButton.onclick = function() {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    //When audio playing
    audio.onplay = function() {
      _this.isPlaying = true;
      playingButton.classList.add('playing');
      cdThumbAnimation.play();
    };

    //When audio stopped
    audio.onpause = function() {
      _this.isPlaying = false;
      playingButton.classList.remove('playing');
      cdThumbAnimation.pause();
    };

    //Progress running
    audio.ontimeupdate = function() {
      if (audio.duration) {
        const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
        progress.value = progressPercent;
      }
    };

    //Set progress
    progress.onchange = function(e) {
      const progressTime = e.target.value / 100 * audio.duration;
      audio.currentTime = progressTime;
    };

    //Next song
    nextButton.onclick = function() {
      if (_this.isRandom) {
        _this.playRandomSong()
      } else {
        _this.nextSong();
        _this.scrollToActiveSong();
      }
      audio.play();
      _this.render();
    };

    //Previous song
    prevButton.onclick = function() {
      if (_this.isRandom) {
        _this.playRandomSong()
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    //Random song
    randomButton.onclick = function() {
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom)
      randomButton.classList.toggle('active', _this.isRandom);
    };

    //Repeat song
    repeatButton.onclick = function() {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat)
      repeatButton.classList.toggle('active', _this.isRepeat);
    };

    //When audio ended
    audio.onended = function() {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextButton.click();
      }
    };

    //Play song when press in song list
    playList.onclick = function(e) {
      const songNode = e.target.closest('.song:not(.active)')
      if (songNode) {
        _this.currentIndex = Number(songNode.dataset.index);
        _this.loadCurrentSong();
        _this.render();
        audio.play();
      }
    }
  },
  scrollToActiveSong: function() {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 200)
  },
  loadCurrentSong: function() {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },
  loadConfig: function() {
    this.isRandom = this.config.isRandom
    this.isRepeat = this.config.isRepeat
  },
  nextSong: function() {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function() {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  playRandomSong: function() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  start: function() {

    this.loadConfig();

    this.defineProperties();
    
    this.handleEvents();

    this.loadCurrentSong();

    this.render(); //Render playlist

    //Random and Repeat initial status
    randomButton.classList.toggle('active', this.isRandom);
    repeatButton.classList.toggle('active', this.isRepeat);
  }
}

app.start();
