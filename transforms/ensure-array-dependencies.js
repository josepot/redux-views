const isRequire = moduleName => path =>
  path.value.type === 'CallExpression' &&
  path.value.callee.type === 'Identifier' &&
  path.value.callee.name === 'require' &&
  path.value.arguments.length === 1 &&
  path.value.arguments[0].type === 'Literal' &&
  path.value.arguments[0].value === moduleName &&
  path.parentPath.value.type === 'VariableDeclarator'

module.exports = function(file, api) {
  const j = api.jscodeshift
  const isArray = (p, scope) => {
    if (p.type === 'ArrayExpression') return true
    if (p.type !== 'Identifier') return false

    const x = scope.lookup(p.name)
    const decl = j(x.getBindings()[p.name][0]).closest(j.VariableDeclaration)

    if (!decl.size()) return false

    const declaration = decl.nodes()[0].declarations[0].init

    return (
      declaration.type === 'ArrayExpression' ||
      (declaration.type === 'Identifier' && isArray(declaration, scope))
    )
  }

  const root = j(file.source)

  let importNsName
  let importAsVariable
  root
    .find(j.ImportDeclaration, { source: { value: 'reselect' } })
    .forEach(p => {
      if (p.value.specifiers.length === 0) return
      if (p.value.specifiers[0].type === 'ImportNamespaceSpecifier') {
        importNsName = p.value.specifiers[0].local.name
      } else {
        const node = p.value.specifiers.find(
          x => x.imported.name === 'createSelector'
        )
        if (!node) return
        importAsVariable = node.local.name
      }
    })

  if (!importNsName && !importAsVariable) {
    root
      .find(j.CallExpression)
      .filter(isRequire('reselect'))
      .forEach(p => {
        if (p.parentPath.value.id.type === 'Identifier') {
          importNsName = p.parentPath.value.id.name
        } else if (p.parentPath.value.id.type === 'ObjectPattern') {
          const node = p.parentPath.value.id.properties.find(
            x => x.key.name === 'createSelector'
          )
          if (!node) return
          importAsVariable = node.value.name
        }
      })
  }

  if (!importNsName && !importAsVariable) return root.toSource()

  const [calleeFinder, expressionFirstArg] = importNsName
    ? [
        {
          object: {
            name: importNsName
          },
          property: {
            name: 'createSelector'
          }
        },
        j.memberExpression(
          j.identifier(importNsName),
          j.identifier('createSelector'),
          false
        )
      ]
    : [
        {
          name: importAsVariable
        },
        j.identifier(importAsVariable)
      ]

  return root
    .find(j.CallExpression, {
      callee: calleeFinder
    })
    .filter(
      p =>
        (p.value.arguments.length === 2 &&
          !isArray(p.value.arguments[0], p.scope)) ||
        p.value.arguments.length > 2
    )
    .replaceWith(p =>
      j.callExpression(expressionFirstArg, [
        p.value.arguments.length === 2 &&
        p.value.arguments[0].type === 'SpreadElement'
          ? j.identifier(p.value.arguments[0].argument.name)
          : j.arrayExpression(p.value.arguments.slice(0, -1)),
        p.value.arguments[p.value.arguments.length - 1]
      ])
    )
    .toSource()
}
