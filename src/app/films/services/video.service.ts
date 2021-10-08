import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})

export class VideoService {

    constructor() {

    }

    getVideoTime(id: number) {
        var videos = localStorage.getItem('watching-videos');
        if (!videos)
            return 0;
        const k: {
            videoId: number,
            time: number
        }[] = JSON.parse(videos);
        var existed = k.find(k1 => k1.videoId == id);
        if (existed)
            return existed.time;
        return 0;
    }

    setVideoTime(id: number, time: number) {
        var videos = localStorage.getItem('watching-videos');
        const k: {
            videoId: number,
            time: number
        }[]
            = videos ? JSON.parse(videos) : [];
        var existed = k.find(k1 => k1.videoId == id);
        if (existed)
            existed.time = time;
        else k.push({ videoId: id, time: time });
        localStorage.setItem('watching-videos', JSON.stringify(k));
    }
}