export interface UpdateEmployeeCommand {
    phoneNumber: string;
    secondNumber: string | null;
    position: string | null;
    salary?: number;
    branchId?: number;
    street: string | null;
    city: string | null;
    nationality: string | null;
}
