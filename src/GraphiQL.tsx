import 'graphiql/graphiql.css'

import { createStyles, makeStyles } from '@material-ui/core'
import classNames from 'classnames'
import RealGraphiQL from 'graphiql'
import GraphiQLExplorer from 'graphiql-explorer'
import { GraphQLSchema, buildClientSchema, getIntrospectionQuery, parse } from 'graphql'
import React, { useCallback, useEffect, useRef, useState } from 'react'

const API_ROOT = process.env.REACT_APP_API_ROOT || window.location.origin + '/api/graphql'

export const useStyles = makeStyles(
  createStyles({
    graphiQlWrapper: {
      height: '100vh',
      overflow: 'hidden',
    },
    box: {
      height: '100%',
      border: '1px solid #d6d6d6',
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
    },
    '@global': {
      '.graphiql-explorer-root': {
        overflow: 'unset !important',
      },
      '.graphiql-container .historyPaneWrap': {
        width: '300px !important',
        boxShadow: 'none !important',
      },
    },
  })
)

const graphQLFetcher = (jwtToken?: string) => (graphQLParams: any) =>
  fetch(API_ROOT, {
    method: 'post',
    headers: jwtToken
      ? {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        }
      : {
          'Content-Type': 'application/json',
        },
    body: JSON.stringify(graphQLParams),
  }).then((response) => response.json())

type Props = { auth?: { jwtToken?: string } }

const GraphiQL: React.FC<Props> = ({ auth = {} }) => {
  const _graphiql = useRef<any>(null)
  const [schema, setSchema] = useState<GraphQLSchema | null>(null)
  const [query, setQuery] = useState<string>('')
  const [explorerIsOpen, setExplorerIsOpen] = useState<boolean>(true)
  const classes = useStyles({})
  const { jwtToken } = auth

  const handleInspectOperation = useCallback(
    (cm: any, mousePos: { line: number; ch: number }) => {
      const parsedQuery = parse(query || '')

      if (!parsedQuery) {
        console.error("Couldn't parse query document")
        return null
      }

      const token = cm.getTokenAt(mousePos)
      const start = { line: mousePos.line, ch: token.start }
      const end = { line: mousePos.line, ch: token.end }
      const relevantMousePos = {
        start: cm.indexFromPos(start),
        end: cm.indexFromPos(end),
      }

      const position = relevantMousePos

      const def = parsedQuery.definitions.find((definition) => {
        if (!definition.loc) {
          console.log('Missing location information for definition')
          return false
        }

        const { start, end } = definition.loc
        return start <= position.start && end >= position.end
      })

      if (!def) {
        console.error('Unable to find definition corresponding to mouse position')
        return null
      }

      const operationKind =
        def.kind === 'OperationDefinition' ? def.operation : def.kind === 'FragmentDefinition' ? 'fragment' : 'unknown'

      const operationName =
        def.kind === 'OperationDefinition' && !!def.name
          ? def.name.value
          : def.kind === 'FragmentDefinition' && !!def.name
          ? def.name.value
          : 'unknown'

      const selector = `.graphiql-explorer-root #${operationKind}-${operationName}`

      const el = document.querySelector(selector)
      el && el.scrollIntoView()
    },
    [query]
  )

  useEffect(() => {
    graphQLFetcher(jwtToken)({
      query: getIntrospectionQuery(),
    }).then((result) => {
      const editor = _graphiql.current !== null && _graphiql.current.getQueryEditor()
      editor &&
        editor.setOption('extraKeys', {
          ...(editor.options.extraKeys || {}),
          'Shift-Alt-LeftClick': handleInspectOperation,
        })
      setSchema(buildClientSchema(result.data))
    })
  }, [handleInspectOperation, jwtToken])

  const handleEditQuery = useCallback((query: string) => setQuery(query), [])

  const handleToggleExplorer = useCallback(() => {
    setExplorerIsOpen((old) => !old)
  }, [])

  return (
    <div className={classNames(classes.graphiQlWrapper)}>
      <div className={classNames(classes.box, 'graphiql-container')}>
        <GraphiQLExplorer
          schema={schema}
          query={query}
          onEdit={handleEditQuery}
          onRunOperation={(operationName: string) => _graphiql.current.handleRunQuery(operationName)}
          explorerIsOpen={explorerIsOpen}
          onToggleExplorer={handleToggleExplorer}
        />
        <RealGraphiQL
          ref={_graphiql}
          fetcher={graphQLFetcher(jwtToken)}
          schema={schema}
          query={query}
          onEditQuery={handleEditQuery}
        >
          <RealGraphiQL.Toolbar>
            <RealGraphiQL.Button
              onClick={() => _graphiql.current.handlePrettifyQuery()}
              label={'Prettify'}
              title={'Prettify Query (Shift-Ctrl-P)'}
            />
            <RealGraphiQL.Button
              onClick={() => _graphiql.current.handleMergeQuery()}
              title={'Merge Query (Shift-Ctrl-M)'}
              label={'Merge'}
            />
            <RealGraphiQL.Button
              onClick={() => _graphiql.current.handleCopyQuery()}
              title={'Copy Query (Shift-Ctrl-C)'}
              label={'Copy'}
            />{' '}
            <RealGraphiQL.Button
              onClick={() => _graphiql.current.handleToggleHistory()}
              label={'History'}
              title={'Show History'}
            />
            <RealGraphiQL.Button onClick={handleToggleExplorer} label={'Explorer'} title={'Toggle Explorer'} />
          </RealGraphiQL.Toolbar>
        </RealGraphiQL>
      </div>
    </div>
  )
}

export default GraphiQL
