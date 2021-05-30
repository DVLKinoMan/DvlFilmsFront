import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Person } from './person';
import { PersonsService } from './services/persons.service';

@Component({
  selector: 'app-person-edit',
  templateUrl: './person-edit.component.html',
  styleUrls: ['./person-edit.component.css']
})
export class PersonEditComponent implements OnInit {
  model: Person;
  id: number;

  constructor(private service: PersonsService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params=>{
        this.id = params['id'];
        this.loadPerson();
    })
  }

  loadPerson(){
    this.service.getById(this.id).subscribe(result =>{
          if(result.profilePicture != undefined)
            result.profilePicture.image =  'data:image/png;base64,' + result.profilePicture.image;
        this.model = result;
    }, error=>console.log(error));
  }
}
