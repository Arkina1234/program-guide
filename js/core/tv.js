/*
 * TV Simulator '99
 * @Author: zshall 
 * @Date: 2017-05-02 22:34:58 
 * @Last Modified by: zshall
 * @Last Modified time: 2017-05-03 00:31:21
 */

 class TV {
    constructor(options) {
        this.maxWidth = options.maxWidth;
        this.maxHeight = options.maxHeight;
        this.warmupTime = options.warmupTime;
        this.firstStart = options.firstStart;
        this.frameless = options.frameless;
        this.classes = {
            Channel12
        };
    }

    startUp() {
        $(document).ready(() => {
            if( !Helpers.isMobile().any() ){
                $(window).resize(() => {
                    this.handleResize();
                });
                if (!this.frameless) {
                    $('.screen').addClass('scanlines');
                }
            }
        
            this.handleResize();
            
            if (!this.frameless) {
                // about
                $('#about-button').click(() => {
                    $('.about').toggle();
                })
                $('.about').toggle();
            
                // other TV buttons
                $('#tv-mute').click(() => {
                    this.toggleMute();
                });
            } else {
                $('.tv-mask, #about-button, #tv-mute, .about').hide();
            }
            
            document.addEventListener('youtubeReady',() => {
                // initialize listings grid
                $.ajax({
                    type: 'GET',
                    url: 'data/guide.xml',
                    dataType: 'xml',
                    complete: (data, status) => {
                        window.guideData = $($.parseXML(data.responseText));
                        var defaultChannel = guideData.find('channel[watchable][default]').attr('number');
                        if (undefined != defaultChannel && null != defaultChannel) {
                            this.showChannel(defaultChannel);
                        }
                    }
                });
            });
        
            YouTubeApi.loadYouTubeAPI();
        });
        
     }

    showChannel(number, callback) {
        if (this.channel) {
            this.channel.teardown();
        }

        $('#tvm-top-right').css('opacity', '0');
        $('.current-channel').css('opacity', '0').attr('id', `ch-${number}`).load(`channels/${Helpers.padLeft(number, 3)}/layout.html`, () => {
            this.channel = new this.classes['Channel' + number]($('.current-channel'), window.guideData);
            this.channel.show();
            $('.current-channel, #tvm-top-right').animate({opacity: 1}, this.firstStart ? this.warmupTime : this.warmupTime / 10, 0, () => {
                this.channel.ready();
            });
            $('#tvm-top-right').text(Helpers.padLeft(number, 2));
            setTimeout(() => {
                $('#tvm-top-right').text('');
            }, 4000);
            this.firstStart = false;
        });
    }

    toggleMute() {
        this.muted = YouTubeApi.toggleMuteVideo(this.channel.player);
        this.afterMute();
    }

    unmute() {
        this.toggleMute(false);
        this.afterMute();
    }

    mute() {
        this.toggleMute(true);
        this.afterMute();
    }

    afterMute() {
        if (this.muted) {
            $('#tvm-bottom-left').text('MUTING');
        } else {
            $('#tvm-bottom-left').text('');
        }
    }

    // http://stackoverflow.com/a/18751691/970180
    handleResize() {
        let $window = $(window);
        let width = $window.width();
        let height = $window.height();
        let scale;

        // early exit
        if(width >= this.maxWidth && this.height >= this.maxHeight) {
            $('.tv').css({'transform': ''});
            return;
        }

        scale = Math.min(width/this.maxWidth, height/this.maxHeight);

        $('.tv').css({'transform': 'scale(' + scale + ')'});
    }
}