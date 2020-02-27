import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { Storage } from '@ionic/storage';
import { AppGlobals } from '../app.globals';
import { TechnicianActivity } from '../models/technician-activity';
import { BehaviorSubject, Observable, from, of, forkJoin } from 'rxjs';
import * as moment from 'moment';
import { Coordinate } from '../models/coordinate';

const STORAGE_REQ_KEY = 'activities';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  activities = new BehaviorSubject([]);

  constructor(private _global: AppGlobals, private http: HTTP, private storage: Storage) {
    this.pushActivities();
  }

  recordActivity(technicianId: string, activityDate: string, activityType: string, activityMode: string, source: string, jobDetals: {}, gpsCoordinate: Coordinate, networkCoordinate: Coordinate) {

    let activity: TechnicianActivity = {
      activityDate: activityDate,
      activityMode: activityMode,
      activityType: activityType,
      jobDetails: jobDetals,
      location: { gpsCoordinate: gpsCoordinate, networkCoordinate: networkCoordinate },
      source: source,
      technicianId: technicianId
    };

    this.storage.get(STORAGE_REQ_KEY).then(objs => {
      let storedObj = [];
      if (objs != null) {
        storedObj = JSON.parse(objs);
      }
      storedObj.push(activity);
      return this.storage.set(STORAGE_REQ_KEY, JSON.stringify(storedObj));
    });

  }

  getActivities(): Observable<TechnicianActivity[]> {
    return from(this.storage.get(STORAGE_REQ_KEY).then(activities => {
      return JSON.parse(activities);
    }));
  }

  pushActivities() {
    this.getActivities().subscribe(list => {
      if (list.length) {
        this.http.post(
          this._global.API_URL + '/api/saveActivity/',
          {
            "officeId": "AJM", access_token: localStorage.getItem('access_token'), userId: localStorage.getItem('user_id'), activityJson: JSON.stringify(list)
          },
          {}
        ).then(data => {
          let response = JSON.parse(data.data);
          if (response.status == 0) {
            this.storage.set(STORAGE_REQ_KEY, JSON.stringify({}));
          }
        }).catch(error => {
          console.log(JSON.stringify(error));
        });
      }
    });
  }

}
