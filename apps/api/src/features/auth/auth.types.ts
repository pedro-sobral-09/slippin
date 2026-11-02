import type { Role } from "../../shared/types/role.js";
import type { SellerStatus } from "../../shared/types/seller-status.js";

export interface UserResponse {
	id: string;
	name: string;
	email: string;
	role: Role;
	sellerStatus: SellerStatus;
}

export interface AuthResponse {
	data: {
		accessToken: string;
		user: UserResponse;
	};
}
