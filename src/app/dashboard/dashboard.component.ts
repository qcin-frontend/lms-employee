import { Component, OnInit, OnDestroy } from '@angular/core'
import { LmsService } from '../lms.service'
// import { ApiService } from '../api.service'
// import * as moment from 'moment'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit, OnDestroy {
  loader: boolean = false
  // public momentDate = moment()
  // public daysArr
  hide: boolean = true
  employee = new Array()
  leave = new Array()
  leaveRejected = new Array()
  myLeaveStatus: any

  unsubMyLeaves: any
  unsubZeroLeaves: any
  unsubGetEmployees: any
  unsubLoader: any

  constructor(private lms: LmsService) {//, private api: ApiService
    this.unsubLoader = this.lms.emitsload.subscribe(el => this.loader = el)
    this.lms.showLoader()

    this.unsubGetEmployees = this.lms.emitgetEmployees.subscribe(r => this.employee = r)
    this.unsubZeroLeaves = this.lms.emitMyZero.subscribe(r => this.hide = false)
    this.unsubMyLeaves = this.lms.emitMyLeaves.subscribe(r => {
      this.leave = r
      // console.log(r)
      /* for (let i=0; i < r.length; i++ ){
        switch (r[i].leave_status) {
          case "Approved!!":
            this.leave.push(r[i])
            break
          case "Rejected":
            this.leaveRejected.push(r[i])
          break
          case "Pending":
            this.leave.push(r[i])
        }
      } */
    })
  }

  public ngOnInit() {
    this.lms.getEmployees()
    this.lms.myLeaves()
  }
  ngOnDestroy() {
    this.unsubLoader.unsubscribe()
    this.unsubGetEmployees.unsubscribe()
    this.unsubMyLeaves.unsubscribe()
    this.unsubZeroLeaves.unsubscribe()
  }
}
