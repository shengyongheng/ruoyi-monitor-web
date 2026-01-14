import copyText from './common/copyText'
import highlight from './highlight/highlight'
import hasPermi from './permission/hasPermi'
import hasRole from './permission/hasRole'

export default function directive(app){
  app.directive('hasRole', hasRole)
  app.directive('hasPermi', hasPermi)
  app.directive('copyText', copyText)
  app.directive('highlight', highlight)
}