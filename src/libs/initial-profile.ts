import { currentUser, redirectToSignIn } from '@clerk/nextjs'

import { db } from '@/libs/db'
import { Profile } from '@prisma/client'

export const initialProfile: () => Promise<Profile> = async () => {
  const user = await currentUser()
  if (!user) return redirectToSignIn()

  const profile = await db.profile.findUnique({
    where: {
      userId: user?.id,
    },
  })

  if (profile) return profile

  const newProfile = await db.profile.create({
    data: {
      userId: user?.id,
      name: `${user?.firstName} ${user?.lastName}`,
      image: user?.imageUrl,
      email: user.emailAddresses[0].emailAddress,
    },
  })

  return newProfile
}
