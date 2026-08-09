// Response shape only (not validated input), but kept as a typed DTO
// so the controller's return type is explicit and Swagger-friendly later.
export class GuestLoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    username: string;
    authProvider: string;
  };
}