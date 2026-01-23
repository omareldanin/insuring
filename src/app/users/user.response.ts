import { Prisma } from "@prisma/client";

export const userSelect = {
  id: true,
  name: true,
  phone: true,
  avatar: true,
  role: true,
  deleted: true,
  deletedAt: true,
  password: true,
} satisfies Prisma.UserSelect;

export const userSelectReform = (
  user: Prisma.UserGetPayload<{
    select: typeof userSelect;
  }> | null,
) => {
  if (!user) {
    throw new Error("لم يتم العثور على المستخدم");
  }
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
  };
};
