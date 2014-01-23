define(['text!Game/content/tracks.json', './utility'], function (TrackDefinitions, Utility)
{
    'use strict';

    var SoundManager = {
        globalVolume: 1,
        isEnabled: true,
        sounds: [],
        tracks: [],
        trackDefinitions: JSON.parse(TrackDefinitions),

        getTrack: function (name, autoLoad)
        {
            var track = this.tracks[name];
            if (!track && autoLoad !== false)
                return this.loadTrack(name);

            return track || this.emptyTrack;
        },

        isAudioSupported: function ()
        {
            if (this.format == null && window.Audio != null)
            {
                var audio = new Audio();
                if (audio.canPlayType('audio/ogg; codecs=vorbis'))
                    this.format = '.ogg';
                else if (audio.canPlayType('audio/mp4; codecs="mp4a.40.5"'))
                    this.format = '.aac';
            }

            return this.format != null;
        },

        loadTrack: function (name)
        {
            if (this.isEnabled && this.isAudioSupported())
            {
                var trackDefinition = this.trackDefinitions[name];
                if (trackDefinition)
                {
                    var track = new Track(trackDefinition);
                    this.tracks[name] = track;
                    return track;
                }
            }

            return this.emptyTrack;
        },

        unload: function ()
        {
            this.sounds.length = 0;
            this.tracks.length = 0;
        },

        unloadTrack: function (name)
        {
            delete this.tracks[name];
        }
    };

    function getInactiveChannel(sound)
    {
        for (var i = 0; i < sound.channels.length; i++)
        {
            var channel = sound.channels[i];
            if (channel.paused || channel.ended)
            {
                channel.currentTime = 0;
                if (channel.currentTime !== 0)
                    channel.load();

                return channel;
            }
        }

        return loadChannel(sound);
    }

    function loadChannel(sound)
    {
        var audio = new Audio('Game/content/sounds/' + sound.name + SoundManager.format);
        if (!sound.isLoaded)
        {
            audio.addEventListener('canplaythrough', function onAudioLoaded()
            {
                sound.isLoaded = true;
                if (sound.onLoaded)
                    sound.onLoaded();

                audio.removeEventListener('canplaythrough', onAudioLoaded, false);
            }, false);

            audio.addEventListener('error', function ()
            {
                console.log('audio load error', arguments);
            }, false);
        }

        audio.preload = 'auto';
        audio.load();

        sound.channels.push(audio);
        return audio;
    }


    function Sound(name)
    {
        this.name = name;
        this.channels = [];
        this.isLoaded = false;
        loadChannel(this);
    }

    Sound.prototype.play = function (volume, onComplete)
    {
        if (this.isLoaded)
        {
            var audio = getInactiveChannel(this);
            audio.volume = SoundManager.globalVolume * (volume || 1);

            if (onComplete)
            {
                audio.addEventListener('ended', function handleOnComplete()
                {
                    audio.removeEventListener('ended', handleOnComplete);
                    onComplete();
                }, false);
            }

            audio.play();
        }
        else
        {
            this.onLoaded = function ()
            {
                this.play(volume, onComplete);
                this.onLoaded = null;
            };
        }
    };

    Sound.prototype.stop = function ()
    {
        if (this.isLoaded)
        {
            for (var i = 0; i < this.channels.length; i++)
                this.channels[i].pause();
        }
    };


    function Track(trackData)
    {
        this.soundConfigs = [];
        if (trackData)
        {
            for (var i = 0; i < trackData.length; i++)
            {
                var soundData = trackData[i];
                var soundConfig = {delay: 0};

                if (typeof soundData === 'string')
                    soundConfig.name = soundData;
                else
                    Utility.merge(soundConfig, soundData);

                var sound = SoundManager.sounds[soundConfig.name];
                if (!sound)
                {
                    sound = new Sound(soundConfig.name);
                    SoundManager.sounds[soundConfig.name] = sound;
                }

                soundConfig.sound = sound;
                this.soundConfigs.push(soundConfig);
            }
        }
    }

    Track.prototype.play = function (volume, loop)
    {
        this.stop();
        this.playSound(0, volume || 1, loop);
    };

    Track.prototype.playSound = function (index, volume, loop)
    {
        if (index >= this.soundConfigs.length && loop)
            index = 0;

        var soundConfig = this.soundConfigs[index];
        if (soundConfig)
        {
            var self = this;
            setTimeout(function ()
            {
                soundConfig.sound.play(volume, function ()
                {
                    self.playSound(++index, volume, loop);
                });
            }, soundConfig.delay);
        }
    };

    Track.prototype.stop = function ()
    {
        for (var i = 0; i < this.soundConfigs.length; i++)
            this.soundConfigs[i].sound.stop();
    };


    SoundManager.emptyTrack = new Track();
    return SoundManager;
});