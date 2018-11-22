import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'// , Router, Params 
import { ApiService } from '../api.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  uname: any
  pwd: any
  unsubLogin: any
  urlName: any

  constructor(private api: ApiService, private router: Router, private route: ActivatedRoute) {
    if (router.url == '/login?email=rep'){
      localStorage.removeItem('token')
      localStorage.removeItem('userName')
      localStorage.removeItem('qci_id')  
    }
  }

  isLogin() {
    localStorage.setItem('userName', this.uname)
    this.api.login(this.uname, this.pwd)
  }
  
  ngOnInit() {
    this.api.isLogin()
  }

}
