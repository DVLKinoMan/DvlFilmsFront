import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Filmography, Person } from './person';
import { Gender, ZodiacSign } from './person-query';
import { PersonFetcherService } from './services/person-fetcher.service';
import { PersonsService } from './services/persons.service';

@Component({
  selector: 'app-person-edit',
  templateUrl: './person-edit.component.html',
  styleUrls: ['./person-edit.component.css']
})
export class PersonEditComponent implements OnInit {
  model: Person;
  id: number;
  selectedZodiacSign: string;
  personForm: FormGroup;
  editMode: boolean = false;
  
  selectedFilmographyCatName: string = "";
  filmographyCategoryNames: string[] = [];

  selectedFlmSortBy: string = 'Year';
  sortChoicesForFilms: string[] = ['Year'];
  sortAscending: boolean;

  filmographies: Filmography[];

  zodiacSigns: string[] = Object.keys(ZodiacSign).filter(val => isNaN(Number(val)));
  genders: string[] = Object.keys(Gender).filter(val => isNaN(Number(val)));

  constructor(private service: PersonsService,
    private fetcherService: PersonFetcherService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.personForm = this.formBuilder.group({
      sign: ''
    });
    this.route.queryParams.subscribe(
      params => {
        this.selectedFilmographyCatName = params['flmCatName'];
        this.selectedFlmSortBy = params['flmSortBy'] ? params['flmSortBy'] : this.selectedFlmSortBy;
        this.sortAscending = params['flmSortAscending'] === "true" ? true : false;
      }
    );
    this.route.params.subscribe(params=>{
        this.id = params['id'];
        this.loadPerson();
    });
  }

  save(){
    var val = this.model.zodiacSign;
  }

  sortingChanged(){
    this.sortAscending = !this.sortAscending;
    this.loadFilmItems();
  }

  changeQueryParams(){
    this.router.navigate(
      [], 
      {
        relativeTo: this.route,
        queryParams: { 
          flmCatName: this.selectedFilmographyCatName,
          flmSortBy: this.selectedFlmSortBy,
          flmSortAscending: this.sortAscending
        },
        queryParamsHandling: 'merge'
      });
  }

  loadFilmCategories(){
        this.selectedFilmographyCatName ??= this.model.filmographies?.[0].categoryName ?? "";
        this.filmographyCategoryNames = 
        [...new Set(this.model.filmographies?.map(item=>item.categoryName) ?? [])];
  }

  loadFilmItems(){
      if(this.model.filmographies){
          let items: Filmography[] = [];
          let catName = this.selectedFilmographyCatName;
          this.model.filmographies.forEach(function(val){
            if(val.categoryName == catName)
              items.push(val);
          });
          items.sort((a,b) => { 
            switch(this.selectedFlmSortBy){
              case 'Year': 
                return this.sortAscending ? (a.year && (!b.year || a.year < b.year) ? -1 : 1 )
                : (b.year && (!a.year || a.year < b.year) ? 1 : -1 );
              default: throw new Error("Sorting is not Implemented");
            }
          });
          this.filmographies = items;
          this.changeQueryParams();
      }
  }

  fetchPersonFromImdb(){
    this.fetcherService.getByUrl(this.model.imdbPageUrl).subscribe(result => {
      this.model = result;
      // if(this.model.filmographies)
      //   this.model.filmographies.forEach(function(value){
      //     if(value.filmItem?.photo?.image)
      //       value.filmItem.photo.image = 'data:image/png;base64,' + value.filmItem.photo.image;
      //   });
      let imdbPageUrls: string[] = [];
      this.model.filmographies?.forEach(function(value){
        if(value.filmItem)
          imdbPageUrls.push(value.filmItem.imdbPageUrl);
      });

      var batch = 30;
      for(var i = 0; i< imdbPageUrls.length; i+=batch)
      this.service.getPersonFilmItems(imdbPageUrls.slice(i, i + batch > imdbPageUrls.length ?
          imdbPageUrls.length - 1 : i + batch - 1
        )).subscribe(result =>{
              if(this.model.filmographies)
                this.model.filmographies.forEach(function(value){
                  if(value.filmItem)
                    {
                      result.forEach(function(res){
                        if(res.imdbPageUrl == value.filmItem?.imdbPageUrl){
                          value.filmItem.id = res.id;
                          value.filmItem.photo = res.photo;
                          if(value.filmItem.photo)
                            value.filmItem.photo.image = 'data:image/png;base64,' 
                            + value.filmItem.photo.image;
                        }
                      });
                    }
                });
              this.loadFilmCategories();
              this.loadFilmItems();
        }, error=>console.log(error));
    }, error=>console.log(error));
  }

  loadPerson(){
    this.service.getById(this.id).subscribe(result =>{
          this.model = result;
          if(this.model.profilePicture)
            this.model.profilePicture.image =  'data:image/png;base64,' + this.model.profilePicture.image;
    }, error=>console.log(error));

    this.service.getFilmographies(this.id).subscribe(result =>{
          this.model.filmographies = result;
          if(this.model.filmographies)
            this.model.filmographies.forEach(function(value){
              if(value.filmItem?.photo?.image)
                value.filmItem.photo.image = 'data:image/png;base64,' + value.filmItem.photo.image;
            });
          this.loadFilmCategories();
          this.loadFilmItems();
    }, error=>console.log(error));
  }
}
