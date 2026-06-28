export interface CreateEmployeeCommand {
    firstName: string;
    lastName: string;
    ssn: string;
    salary: number;
    gender: string;
    birthDate: string | null;
    email: string | null;
    nationality: string | null;
    street: string | null;
    city: string | null;
    phoneNumber: string;
    secondNumber: string | null;
    position: string | null;
    branchId: number;
}
