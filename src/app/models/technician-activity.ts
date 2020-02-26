export interface TechnicianActivity {
    technicianId: string,
    activityDate: Date,
    activityType: string,
    activityMode: string,
    source: string,
    jobDetails: {},
    location: {
        gpsCoordinate: { latitude: string, longitude: string }
        networkCoordinate: { latitude: string, longitude: string }
    }
}