import { Values } from "../types"
import userSignInService from "../services/signInService"

import {
  rxDb,
  Setting,
  Auth,
  AuthPrimary as Primary,
  DynamicRoute,
  notice
} from "@bunred/bunadmin"
import { NextRouter } from "next/router"
import { TFunction } from "i18next"

interface Props {
  t: TFunction
  values: Values
  setSubmitting: (isSubmitting: boolean) => void
  router: NextRouter
}

const submitController = async ({
  t,
  values,
  setSubmitting,
  router
}: Props) => {
  const res = await userSignInService(values)
  setSubmitting(false)
  // Sign-in successfully
  if (res && res.token) {
    // store user profile
    const primary = Primary
    const updated_at = Date.now()

    const db = await rxDb()
    // store auth
    await db[Auth.name].upsert({
      [primary]: res.username,
      token: res.token,
      role: res.role,
      details: JSON.stringify(res),
      updated_at
    })
    // update username in setting
    await db[Setting.name].upsert({
      name: Primary,
      value: res[Primary],
      updated_at: Date.now()
    })
    // show notice
    await notice({ title: t("Sign in successful") })
    // push to origin url
    const { asPath } = router
    const pathArr = asPath.split("?redirect=")
    const redirect = pathArr[1] || "/"
    const regex = /\//g
    const matchStr: RegExpMatchArray = redirect.match(regex) || []
    // is match /[group]/[name]
    const isMatch = matchStr.length === 2

    if (regex && isMatch) {
      router.replace(DynamicRoute, redirect).then(_r => {})
    } else {
      router.replace(redirect).then(_r => {})
    }
  } else {
    // show notice
    await notice({
      title: t("Sign in failed"),
      severity: "error",
      content: JSON.stringify(res)
    })
  }
}

export default submitController
