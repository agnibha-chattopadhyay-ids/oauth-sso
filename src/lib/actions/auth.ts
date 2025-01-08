import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { LoginInput, RegisterInput } from "@/lib/validations/auth";
import { signIn } from "@/lib/auth";

export async function login(data: LoginInput) {
	try {
		await signIn("credentials", {
			email: data.email,
			password: data.password,
			redirect: false,
		});

		return { success: true };
	} catch (error) {
		console.error("Login error:", error);
		return { error: "Invalid credentials" };
	}
}

export async function register(data: RegisterInput) {
	try {
		const existingUser = await prisma.user.findUnique({
			where: { email: data.email },
		});

		if (existingUser) {
			return { error: "Email already exists" };
		}

		const hashedPassword = await hash(data.password, 10);

		await prisma.user.create({
			data: {
				name: data.name,
				email: data.email,
				password: hashedPassword,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Registration error:", error);
		return { error: "Something went wrong with registration" };
	}
} 