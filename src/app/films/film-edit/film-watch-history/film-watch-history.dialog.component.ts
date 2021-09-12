import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FilmWatch } from "../../film-watch.model";
import { FilmBuiltInListsService } from "../../services/filmBuiltInLists.service";

@Component({
    selector: 'app-film-watch-history-dialog',
    templateUrl: './film-watch-history.dialog.component.html',
})

export class FilmWatchHistoryDialogComponent implements OnInit {
    watches: FilmWatch[];
    newWatch: FilmWatch;
    showNewWatch: boolean = false;
    loading: boolean = true;

    constructor(
        public dialogRef: MatDialogRef<FilmWatchHistoryDialogComponent>,
        private builtInListsService: FilmBuiltInListsService,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) {
        this.loadWatches();
    }

    ngOnInit(): void {
        this.newWatch = new FilmWatch(this.data.filmId, new Date());
    }

    onCloseClick() {
        this.dialogRef.close();
    }

    onSaveClick() {
        this.loading = true;
        if (this.watches.length == 0) {
            this.builtInListsService.deleteFromWatched(this.data.filmId).subscribe(res => {
                this.loading = false;
                this.dialogRef.close(true);
            }, error => {
                console.log(error);
                this.loading = false;
            });
            return;
        }

        this.builtInListsService.updateWatchHistory(this.watches).subscribe(result => {
            this.loading = false;
            this.dialogRef.close(true);
        }, error => {
            console.log(error);
            this.loading = false;
        });
    }

    removeWatch(name: FilmWatch) {
        var index = this.watches.indexOf(name);

        if (index >= 0)
            this.watches.splice(index, 1);
    }

    addNewWatch() {
        this.watches.push(this.newWatch);
        this.showNewWatch = false;
        this.newWatch = new FilmWatch(this.data.filmId, new Date());
    }

    loadWatches() {
        this.builtInListsService.getWatchHistory(this.data.filmId).subscribe(result => {
            this.watches = result;
            this.loading = false;
        }, error => console.log(error));
    }
}

export interface DialogData {
    filmId: number;
    filmName: string;
}
