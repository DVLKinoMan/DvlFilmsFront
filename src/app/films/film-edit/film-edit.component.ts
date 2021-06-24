import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Person } from "src/app/persons/person";
import { Gender } from "src/app/persons/person-query";
import { PhotosService } from "src/app/common/services/photos.service";
import { Film, FilmCastMember } from "../film";
import { FilmsService } from "../services/films.service";
import { Photo } from "src/app/common/photo";

@Component({
    selector: 'app-film-edit',
    templateUrl: './film-edit.component.html',
    styleUrls: ['./film-edit.component.css']
})

export class FilmEditComponent implements OnInit {
    id: number;
    model: Film;
    fetched?: Film;
    editMode: boolean = false;
    filmForm: FormGroup;

    cast: FilmCastMember[];
    castItemsPerPage: number = 10;
    castCurrPage: number = 0;
    castPagesLength: number = 0;
    allCast: FilmCastMember[];
    leftCastArrowDisabled: boolean = true;
    rightCastArrowDisabled: boolean = false;

    showPhotos: number = 5;

    constructor(private service: FilmsService,
        private photosService: PhotosService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder) {
        this.route.params.subscribe(item => {
            this.id = item['id'];
            this.loadFilm();
            this.loadCast();
        });
    }
    ngOnInit(): void {
        this.filmForm = this.formBuilder.group({

        });
    }

    setDefaultProfilePicture(event: any, castMember: FilmCastMember) {
        if (typeof castMember.gender == "string")
            event.target.src = castMember.gender == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.jpeg'
        else event.target.src = castMember.gender == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.jpeg'
    }

    setDefaultPersonPhoto(event: any, person: Person) {
        if (typeof person.sex == "string")
            event.target.src = person?.sex == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.jpeg'
        else event.target.src = person?.sex == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.jpeg'
    }

    fetchFilmFromImdb() {

    }

    save() {

    }

    loadFilm() {
        this.service.getById(this.id).subscribe(result => {
            this.photosService.fixImage(result.photo);
            this.model = result;
            this.photosService.getFilmPhotos(this.id, 0, this.showPhotos).subscribe(result => {
                this.photosService.fixImages(result);
                this.model.photos = result;
            }, error => console.log(error));
        }, error => console.log(error));
    }

    castPageArrowClicked(right: boolean) {
        this.castCurrPage = right ? this.castCurrPage + 1 : this.castCurrPage - 1;
        this.cast = this.allCast.slice(this.castCurrPage * this.castItemsPerPage,
            this.castCurrPage * this.castItemsPerPage + this.castItemsPerPage);
        this.leftCastArrowDisabled = this.castCurrPage < 1;
        this.rightCastArrowDisabled = this.castCurrPage >= this.castPagesLength - 1;
    }

    loadCast() {
        this.service.getCast(this.id).subscribe(result => {
            this.photosService.fixImagesForCast(result);
            this.allCast = result;
            this.cast = this.allCast.slice(0, this.castItemsPerPage);
            this.castPagesLength = Math.floor(this.allCast.length / this.castItemsPerPage) +
                (this.allCast.length % this.castItemsPerPage > 0 ? 1 : 0);
            this.leftCastArrowDisabled = true;
            this.rightCastArrowDisabled = this.castPagesLength <= 1;
        }, error => console.log(error));
    }
}