'use client'

import { FC, ReactNode, useState } from 'react'

import { useRouter } from 'next/navigation'

import { TasksList } from '@/components/Tasks/List'
import { IGeneralTask, IScore, ISolved } from '@/types/tasks'

import { TasksSidebar } from './TasksSidebar'

type TaskSearchProps = {
  header: ReactNode
  tasks: IGeneralTask[]
  solved: ISolved[]
  score: IScore[]
  bookmarks: string[]
}

export const TaskSearch: FC<TaskSearchProps> = ({
  header,
  tasks,
  solved,
  score,
  bookmarks
}) => {
  const router = useRouter()

  const [filteredTasks, setFilteredTasks] = useState<IGeneralTask[]>(tasks)

  const processedTasks = filteredTasks
    .map(task => ({
      ...task,
      solved: solved
        ? solved.find(item => item.taskId === task.id)?.count || 0
        : 0,
      score: score ? score.find(item => item.taskId === task.id)?.max || 0 : 0,
      bookmarked: bookmarks ? bookmarks.includes(task.id) : false,
      tried: score
        ? score.find(item => item.taskId === task.id) !== undefined
        : false
    }))
    .sort((a, b) => {
      if (a.id < b.id) {
        return -1
      } else if (a.id > b.id) {
        return 1
      } else {
        return 0
      }
    })

  return (
    <>
      <div className="flex w-full flex-col items-center pb-6 pt-6">
        {header}
        <input
          className="my-4 w-60 rounded-md border-gray-300 bg-gray-100 px-2 py-1 text-sm shadow-sm dark:border-slate-900 dark:bg-slate-700 dark:text-gray-100"
          placeholder="Search..."
          onChange={async e => {
            router.replace('/tasks?page=1')

            const { value } = e.currentTarget
            if (value) {
              const Fuse = (await import('fuse.js')).default
              const fuse = new Fuse(tasks, {
                keys: ['id', 'title'],
                threshold: 0.125
              })

              setFilteredTasks(fuse.search(value).map(val => val.item))
            } else {
              setFilteredTasks(tasks)
            }
          }}
        />
      </div>
      <div className="flex w-full flex-col md:flex-row">
        <TasksSidebar />
        <TasksList tasks={processedTasks} />
      </div>
    </>
  )
}