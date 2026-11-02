import type { Role } from "../../shared/types/role.js";
import type { SellerStatus } from "../../shared/types/seller-status.js";

export interface User {
	id: string;
	name: string;
	email: string;
	role: Role;
	sellerStatus: SellerStatus;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
}
