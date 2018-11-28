import { Component, OnInit, OnDestroy } from "@angular/core"
import { LmsService } from "../lms.service"
import { ApiService } from "../api.service"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { MatDatepickerInputEvent } from "@angular/material/datepicker"
import * as moment from "moment"
import { MatSnackBar } from '@angular/material'
declare var $

@Component({
  selector: "app-apply",
  templateUrl: "./apply.component.html",
  styleUrls: ["./apply.component.scss"]
})

export class ApplyComponent implements OnInit, OnDestroy {
  firstFormGroup: FormGroup; secondFormGroup: FormGroup
  minDate = new Date(); minDate2 = new Date()
  isLinear: boolean = true; loader: boolean = false; isFirstDateSelected: boolean = true; zeroHolidays: boolean = false
  condition: boolean = false; scondition: boolean = false; dis: any = false; isHalfDay: boolean = false; issHalfDay: boolean = false;
  isHalfDaySL: boolean = false; 
  issHalfDaySL: boolean = false; 
  conditionSL: boolean = false; sconditionSL: boolean = false;
  disabledSL: boolean = true; sdisabledSL: boolean = true; showHalfDaySL: boolean = false;
  disabled: boolean = true; sdisabled: boolean = true; showHalfDay: boolean = false; noSameDay: boolean = true;noSameDaySL: boolean = true;
  selectedValue: string; dis2:any;
  getDate2: any; fDate: any; sDate: any; today: any; leavedays: any; selected: any; tDate:any; test:any
  firstDate: any; secondDate: any; sundays: any; sundaySaturday:any; totalDays: any = []; dayList: any; filteredDayList: any = []; 
  date: any; month: any; year: any; getDate: any; leave_type: any; leave_reason: any
  ifLAL: any; toggleHalf: any; dL_removal: boolean = false; sdL_removal: boolean = false;dL_removal_SL: boolean = false;sdL_removal_SL: boolean = false; 
  compulsory: any = []; restricted: any = []; compulsoryDates: any = []; restrictedDates: any = []; rdm : any = []; cdm : any = []; applyLeave = new Array(); employee = new Array(); holidays: any = new Array(); leave = new Array()
  unsubLoader: any; unsubGetEmployee: any; unsubGetHoliday: any; unsubMyLeaves: any
  clAct : boolean = true
  slAct : boolean = true
  
  snackBars(message:string,action:string){
    this.snackBar.open(message, action,{
      duration:4000,
    })
  }

  constructor(public snackBar: MatSnackBar, private api: ApiService, private lms: LmsService, private _formBuilder: FormBuilder) {
    this.unsubLoader = this.lms.emitsload.subscribe(el => (this.loader = el))
    this.lms.showLoader()

    this.unsubGetEmployee = this.api.emitgetEmployee.subscribe(r => {
      this.employee = r
    })
    this.unsubMyLeaves = this.api.emitMyLeaves.subscribe(r => (this.leave = r))
    this.unsubGetHoliday = this.api.emitgetHoliday.subscribe(el => {
      if (el == "Holidays are not updated") this.zeroHolidays = true
      else {
        this.zeroHolidays = false
        setTimeout(() => {
          for (let i = 0; i < el.length; i++) {
            if (i >= el.length - 2) {
              JSON.parse(el[i].data).map(r => {
                if (r.RestrictedHoliday) this.restricted.push(r)
                if (r.CompulsoryHoliday) this.compulsory.push(r)
                this.holidays.push(r)
              })
            }
          }
          this.compulsory.map(e => this.compulsoryDates.push(e["Date"]))
          this.restricted.map(e => this.restrictedDates.push(e["Date"]))
          let d = this.tDate,
            m = this.month
          if (d < 10) this.date = "0" + d
          else this.date = d
          if (m < 9 && m > 0 ) m++ && (this.month = "0" + m)
          else if ( m == 0 ) this.month = "01"
          else m++ && (this.month = m)
          this.today = String(this.date + "/" + this.month + "/" + this.year)
          this.holidays.push({ Today: "Today", Date: this.today })
          this.holidays.sort((a, b) => {
            (a = a.Date.split("/").reverse().join("")), (b = b.Date.split("/").reverse().join(""))
            return a > b ? 1 : a < b ? -1 : 0
          })
        }, 350)
      }
    })
  }

  ngOnInit() {
    this.tDate = this.minDate.getDate() // Get date
    this.month = this.minDate.getMonth() // Now get month
    this.year = this.minDate.getFullYear() // Now get year

    this.api.myLeaves()
    this.api.getHoliday()
    this.firstFormGroup = this._formBuilder.group({
      check11: ["", Validators.required],
      check12: ["", Validators.required],
      check13: ["", Validators.required]
    })
    this.secondFormGroup = this._formBuilder.group({
      check3: ["", Validators.required],
      check4: ["", Validators.required]
    })
    this.api.getEmployee()
  }
  firstDateEvent(event: MatDatepickerInputEvent<Date>) {
    this.date = event.value.getDate() // Get date
    this.month = event.value.getMonth() // Now get month
    this.year = event.value.getFullYear() // Now get year
    
    this.letDateConditions()
    this.firstDate = this.getDate // for moment js
    this.fDate = this.getDate2 // for server
    // enable second datepicker
    this.isFirstDateSelected = false
    
    // Calculate on the basis of second datepicker if already selected || !selected
    if (this.sDate) this.countSundays()
    
    // datpicker will not let user to select previous dates
    this.minDate2 = this.firstDate
  }
  secondDateEvent(event: MatDatepickerInputEvent<Date>) {
    this.date = event.value.getDate() // Get date
    this.month = event.value.getMonth() // Now get month
    this.year = event.value.getFullYear() // Now get year
    
    this.letDateConditions()
    this.secondDate = this.getDate // for moment js
    this.sDate = this.getDate2 // for server
    this.countSundays()
  }
  letDateConditions() {
    let d: number = this.date, m = this.month
    if (d < 10) this.date = "0" + d
    else this.date = d
    if (m < 9 && m > 0 ) m++ && (this.month = "0" + m)
    else if ( m == 0 ) this.month = "01"
    else m++ && (this.month = m)
    // just some bad codes. Optimising.................../.
    this.getDate = String(this.year + "-" + this.month + "-" + this.date)
    this.getDate2 = String(this.date + "/" + this.month + "/" + this.year)
    // check if already a compulsory holiday
    this.compulsoryDates.filter(k => {
      if (this.getDate2.indexOf(k) == 0) this.snackBars("Note:", "Already a holiday")
    })
    // check if already a restricted holiday
    this.restrictedDates.filter(l => {
      if ( this.getDate2.indexOf(l) == 0 && this.ifLAL == 'rh' ) {
        this.snackBars("Note:", "Its a restricted holiday")
      }
    })
    // check if leave dates are already in the current applications of the employee
    // for loop to create a temp array of all dates
    for (let i = 0; i < this.leave.length; i++) {
      if (this.leave[i].leave_status !== "Rejected") {
        // Convert applied date_from in the format DD/MM/YYYY for momentJS for the leave application's
        var x = this.leave[i].date_from.split("/"), y = x[1] + '/' + x[0] + '/' + x[2],
          f = moment(y), s = this.leave[i].date_to,
          arr = []
        while (f.format("DD/MM/YYYY") < s) {
          arr.push(f.format("DD/MM/YYYY"))
          f.add(1, 'day')
        }
        // All the date array[temp array] of particular application 
        arr.push(s)
        arr.filter(k => {
          // is selected date already in the applied application/s list, if index == 0 :=> we found the selected date in already applied application/s(pending,rejected&approved) dates
          if ( this.getDate2.indexOf(k) == 0 ) this.snackBars( "Note:", "Your one of previous application has same date" )
        })
      } // else console.log(this.leave[i].leave_status) // Rejected. Right ??
    }
  }
  // echo 65536 | sudo tee -a /proc/sys/fs/inotify/max user watches
  countSundays() {
    // As well anything you can do with dates
    // Calculate sundays/saturday between two days using MomentJS
    var f = moment(this.firstDate), s = moment(this.secondDate),
      sunday = 0,
      r = [], c = f.clone()
    // calculate leave days list
    // Find all dates between two dates and push them in an array
    this.totalDays = []
    while ( f < s || f == s ) {
      this.totalDays.push(f.format("DD/MM/YYYY"))
      f.add(1, "day")
    }
    if ( f !== s ) {
      this.totalDays.push(s.format("DD/MM/YYYY"))
    }
    // After running while(f < s) loop, reset firstdate to initial. Comment next line to see the effect
    f = moment(this.fDate)
    
    // Find all sunday/'s
    while (c.day(7 + sunday).isBefore(s)) r.push(c.clone())
    this.sundays = r
    
    if ( !( this.ifLAL == undefined ) ){
      this.ifLeavesAreLess(this.ifLAL)
      if (this.ifLAL == 'cl' && this.isHalfDay){
        this.clAct = true
        this.slAct = false
        for (let i = 0; i < this.dayList.length; i++){
          if (this.fDate == this.dayList[i] && this.dL_removal == false){
            this.dayList.splice(i, 1)
            this.dL_removal = true
          }
        }
        this.leavedays -= 0.5
      }
      if (this.ifLAL == 'cl' && this.issHalfDay){
        this.clAct = true
        this.slAct = false
        for (let i = 0; i < this.dayList.length; i++){
          if (this.sDate == this.dayList[i] && this.sdL_removal == false){
            this.dayList.splice(i, 1)
            this.sdL_removal = true
          }
        }
        this.leavedays -= 0.5
      }
      if (this.ifLAL == 'sl' && this.isHalfDaySL){
        this.clAct = false
        this.slAct = true
        for (let i = 0; i < this.dayList.length; i++){
          if (this.fDate == this.dayList[i] && this.dL_removal_SL == false){
            this.dayList.splice(i, 1)
            this.dL_removal_SL = true
          }
        }
        this.leavedays -= 1
      }
      if (this.ifLAL == 'sl' && this.issHalfDaySL){
        this.clAct = false
        this.slAct = true
        for (let i = 0; i < this.dayList.length; i++){
          if (this.sDate == this.dayList[i] && this.sdL_removal_SL == false){
            this.dayList.splice(i, 1)
            this.sdL_removal_SL = true
          }
        }
        this.leavedays -= 1
      }
    }
  }
  disableSunDay = (d: Date): boolean => {
    const day = d.getDay()
    return day !== 0 && day !== 6 // comment if saturday is not disabled
  }
  ifLeavesAreLess(item) {
    this.ifLAL = item
    this.dayList = []
    this.dayList.push(this.totalDays) 
    console.log(this.totalDays)
    var a = Object.keys(this.employee),
      b = Object.values(this.employee) 
    // More functionality added here, not the right name of a function ;-p
    // Calculate leavedays, removing sundays & saturdays total count
    let td: number = moment(this.secondDate).diff(moment(this.firstDate), "days")

    if ( item == "cl" && this.dayList !== undefined){
      this.clAct = true
      this.slAct = false
      if ( this.secondDate == this.firstDate ) this.noSameDay = false
      else this.noSameDay = true
      var rem_sun_date = []
      this.leavedays = 0 // reset leaves
      this.filteredDayList = [] // reset list
      
      // see if compulsory holiday is there ??
      for ( let i = 0; i < this.dayList.length; i++ ){
        this.compulsoryDates.filter(k => {  
          if (this.dayList[i].indexOf(k) == 0) {
            this.dayList.splice(i, 1)
          }
        })
      }
      // remove sundays and saturdays
      for ( let i = 0; i < this.dayList.length; i++ ){
        if ( this.sundays[i] !== undefined ){
          rem_sun_date.push(this.sundays[i].format('DD/MM/YYYY'))
          for ( let j = 0; j < this.dayList.length; j++ ) {
            if ( rem_sun_date[i] == this.dayList[j] ){
              this.filteredDayList.pop()
            } else {
              this.filteredDayList.push(this.dayList[j])
            }
          }
        }
      }
      console.log(this.filteredDayList)
      console.log(this.dayList)
      console.log(this.totalDays)
      if ( this.sundays.length > 0 ){
        this.dayList = this.filteredDayList
      }
      // bad code...... optimised solution ???
      var aa = [], bb = []
      aa = this.dayList
      bb = this.dayList
      this.dayList = bb.concat(aa)
      this.leavedays = this.dayList.length/2
      
      // Half day concept
      this.disabled = false
      this.sdisabled = false
      this.showHalfDay = true // show half day option
      if (this.condition == true && this.isHalfDay == true){
        for (let i = 0; i < this.dayList.length; i++){
          if (this.fDate == this.dayList[i] && this.dL_removal == false){
            this.dayList.splice(i, 1)
            this.dL_removal = true
          }
        }
        this.leavedays -= 0.5
        this.condition = false
      }
      if (this.scondition == true && this.issHalfDay == true){
        for (let i = 0; i < this.dayList.length; i++){
          if (this.sDate == this.dayList[i] && this.sdL_removal == false){
            this.dayList.splice(i, 1)
            this.sdL_removal = true
          }
        }
        this.leavedays -= 0.5
        this.scondition = false
      }
      // Warn user for not taking more than 5 leaves
      if ( this.leavedays > 5 ) this.api.snackBars("Note:", "Casual leaves must be less than 5")
    }
    else if ( ( item == "pl" || item == "eol" || item == "ml" || item == "ptl" || item == "od") && this.dayList !== undefined ) {
      this.leavedays = 0
      this.leavedays = 1 + td
      this.condition = true
      this.scondition = true
      this.disabled = true
      this.sdisabled = true
      this.conditionSL = true
      this.sconditionSL = true
      this.disabledSL = true
      this.sdisabledSL = true
      this.showHalfDay = false
      this.showHalfDaySL = false
      this.dis = false
    }
    else if ( item == "rh" && this.dayList !== undefined ){
      this.leavedays = 0
      this.leavedays = 1 + td
      this.condition = true
      this.scondition = true
      this.disabled = true
      this.sdisabled = true
      this.conditionSL = true
      this.sconditionSL = true
      this.disabledSL = true
      this.sdisabledSL = true
      this.showHalfDay = false
      this.showHalfDaySL = false
      this.dis = true
      // check if already a restricted holiday
      this.restrictedDates.filter(l => {
        if (this.getDate2.indexOf(l) == 0){
          this.snackBars("Note:", "Its a restricted holiday")
          this.dis = false
        }
      })
      if (this.leavedays > 1){
        this.snackBars("Note:", "You can only apply for restricted holidays only")
        this.dis = true
      }
    } else if ( item == "sl" && this.dayList !== undefined ) {
      this.clAct = false
      this.slAct = true
      if ( this.secondDate == this.firstDate ) this.noSameDaySL = false
      else this.noSameDaySL = true
      
      var ccc = [], ddd = []
      this.dayList = []
      this.dayList = this.totalDays
      ccc = this.dayList
      ddd = this.dayList
      this.dayList = ccc.concat(ddd)
      this.leavedays = this.dayList.length
      
      // Half day concept
      this.disabledSL = false
      this.sdisabledSL = false
      this.showHalfDaySL = true // show half day option
      if (this.conditionSL == true && this.isHalfDaySL == true){
        for (let i = 0; i < this.dayList.length; i++){
          if (this.fDate == this.dayList[i] && this.dL_removal_SL == false){
            this.dayList.splice(i, 1)
            this.dL_removal_SL = true
          }
        }
        this.leavedays -= 1
        this.conditionSL = false
      }
      if (this.sconditionSL == true && this.issHalfDaySL == true){
        for (let i = 0; i < this.dayList.length; i++){
          if (this.sDate == this.dayList[i] && this.sdL_removal_SL == false){
            this.dayList.splice(i, 1)
            this.sdL_removal_SL = true
          }
        }
        this.leavedays -= 1
        this.sconditionSL = false
      }
    }
    for (let i = 0; i < a.length; i++){
      if (item == a[i] && item !== 'od' && item !== 'rh') {
        if (this.leavedays > b[i].bal){
          this.snackBars("Note:", "Total applied days are less than your balance leave")
          this.dis = true
        } else this.dis = false
      }
    }
    if ( this.leavedays < 0.5 ){
      this.dis = true
      this.leavedays = 0
      this.api.snackBars("Note:", "'Date from' can not preeced 'Date to'")
    }
    // else this.dis = false
  }
  halfDay() {
    if ( this.ifLAL == 'cl' && !this.isHalfDay ){
      for (let i = 0; i < this.dayList.length; i++){
        if (this.fDate == this.dayList[i] && this.dL_removal == false){
          this.dayList.splice(i, 1)
          this.dL_removal = true
        }
      }
      this.leavedays -= 0.5
    } else if (this.ifLAL == 'cl' && this.isHalfDay){
      if (this.condition && this.isHalfDay) {
        this.condition = !this.condition
      }
      if (!this.condition && this.leavedays < 5 ){
        this.dis = false
        this.dayList.push(this.fDate)
        this.dL_removal = false
        this.leavedays += 0.5
      } else {
        this.dis = true
        this.api.snackBars("Note:", "Casual leaves must be less than 5")
      }
    }
  }
  shalfDay() {
    if ( this.ifLAL == 'cl' && !this.issHalfDay ){
      for (let i = 0; i < this.dayList.length; i++){
        if (this.sDate == this.dayList[i] && this.sdL_removal == false){
          this.dayList.splice(i, 1)
          this.sdL_removal = true
        }
    }
      this.leavedays -= 0.5
    } else if (this.ifLAL == 'cl' && this.issHalfDay){
      if (this.scondition && this.issHalfDay) {
        this.scondition = !this.scondition
      }
      if (!this.scondition && this.leavedays < 5 ){
        this.dis = false
        this.dayList.push(this.sDate)
        this.sdL_removal = false
        this.leavedays += 0.5
      } else {
        this.dis = true
        this.api.snackBars("Note:", "Casual leaves must be less than 5")
      }
    }
  }
  halfDaySL() {
    if ( this.ifLAL == 'sl' && !this.isHalfDaySL ){
      for (let i = 0; i < this.dayList.length; i++){
        if (this.fDate == this.dayList[i] && this.dL_removal_SL == false){
          this.dayList.splice(i, 1)
          this.dL_removal_SL = true
        }
      }
      this.leavedays -= 1
    } else if (this.ifLAL == 'sl' && this.isHalfDaySL){
      if (this.conditionSL && this.isHalfDaySL) {
        this.conditionSL = !this.conditionSL
      }
      if (!this.conditionSL){
        this.dis = false
        this.dayList.push(this.fDate)
        this.dL_removal_SL = false
        this.leavedays += 1
      }
    }
  }
  shalfDaySL() {
    if ( this.ifLAL == 'sl' && !this.issHalfDaySL ){
      for (let i = 0; i < this.dayList.length; i++){
        if (this.sDate == this.dayList[i] && this.sdL_removal_SL == false){
          this.dayList.splice(i, 1)
          this.sdL_removal_SL = true
        }
    }
      this.leavedays -= 1
    } else if (this.ifLAL == 'sl' && this.issHalfDaySL){
      if (this.sconditionSL && this.issHalfDaySL) {
        this.sconditionSL = !this.sconditionSL
      }
      if (!this.sconditionSL){
        this.dis = false
        this.dayList.push(this.sDate)
        this.sdL_removal_SL = false
        this.leavedays += 1
      }
    }
  }
  Applyleave(stepper) {
    if (this.leave_reason !== null && this.leave_reason !== undefined){
      this.dis2 = true
    }
    var temp = localStorage.getItem("userName"), tmp: any
    tmp = {
      qci_id: temp,
      date_of_apply: this.today,
      days: this.leavedays,
      date_from: this.fDate,
      date_to: this.sDate,
      day_list: this.dayList,
      leave_reason: this.leave_reason,
      leave_type: this.leave_type
    }
    this.applyLeave.push(tmp)
    // this.api.applyLeave(tmp, stepper)
  }
  ngOnDestroy() {
    this.unsubLoader.unsubscribe()
    this.unsubGetEmployee.unsubscribe()
    this.unsubGetHoliday.unsubscribe()
    this.unsubMyLeaves.unsubscribe()
  }
}