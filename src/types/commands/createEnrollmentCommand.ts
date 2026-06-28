export interface CreateEnrollmentCommand {
    enrollmentDate: string | null;
    expiryDate: string | null;
    sessionAllowed: number;
    traineeId: number;
    traineeGroupId: number;
    subscriptionDetailsId: number | null;
}
