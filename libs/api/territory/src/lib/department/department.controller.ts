import { Controller, Get } from "@nestjs/common";
import { DepartmentService } from "./department.service";

@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get('update-departments')
  async updateDepts(): Promise<{ success: boolean; message: string }> {
    await this.departmentService.updateDepartments();
    return { success: true, message: 'Departments updated successfully' };
  }
}