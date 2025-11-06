<template>
  <div class="table-container" :class="containerClass">
    <table class="custom-table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="{
              width: getColumnWidth(column),
              textAlign: column.align || 'left',
            }"
          >
            {{ column.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in data"
          :key="getRowKey(row, index)"
          :class="getRowClass(row, index)"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="{
              'ellipsis-cell': true,
              tooltip: needsTooltip(getCellContent(row, column)),
            }"
            :style="{ textAlign: column.align || 'left' }"
            :data-tooltip="
              needsTooltip(getCellContent(row, column))
                ? getTooltipContent(row, column)
                : null
            "
          >
            <slot
              name="cell"
              :row="row"
              :column="column"
              :value="getCellContent(row, column)"
              :index="index"
            >
              <span
                :style="{
                  width: getTrWidth(row, column),
                }"
                v-html="renderCellContent(row, column)"
              ></span>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  rowKey: {
    type: [String, Function],
    default: "id",
  },
  containerClass: {
    type: [String, Object, Array],
    default: "",
  },
  rowClass: {
    type: [String, Function],
    default: "",
  },
});

// 获取列宽
const getColumnWidth = (column) => {
  if (column.width) {
    return column.width;
  }
  return null;
};

// 获取行key
const getRowKey = (row, index) => {
  if (typeof props.rowKey === "function") {
    return props.rowKey(row);
  }
  return row[props.rowKey] || index;
};

// 获取行类名
const getRowClass = (row, index) => {
  if (typeof props.rowClass === "function") {
    return props.rowClass(row, index);
  }
  return props.rowClass;
};

// 获取单元格内容
const getCellContent = (row, column) => {
  return row[column.key];
};
// 获取单元格宽度
const getTrWidth = (row, column) => {
  const content = getCellContent(row, column);
  if (!content || typeof content !== "string") return 'auto';
  return content.length > 20 ? '200px' : 'auto';
};

// 渲染单元格内容
const renderCellContent = (row, column) => {
  const content = getCellContent(row, column);
  if (column.formatter && typeof column.formatter === "function") {
    return column.formatter(content, row, column);
  }
  return escapeHtml(String(content || ""));
};

// HTML转义
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// 检查是否需要tooltip
const needsTooltip = (content) => {
  if (!content || typeof content !== "string") return false;
  return content.length > 20;
};

// 获取tooltip内容
const getTooltipContent = (row, column) => {
  const content = getCellContent(row, column);
  if (column.formatter && typeof column.formatter === "function") {
    // 获取纯文本内容用于tooltip
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = column.formatter(content, row, column);
    return tempDiv.textContent || tempDiv.innerText || "";
  }
  return String(content || "");
};
</script>

<style scoped>
/* 文本溢出处理 */
.ellipsis-cell span {
  /* 支持最多两行并在末尾显示省略号（WebKit/Blink） */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal; /* 允许换行以触发多行截断 */
  line-height: 1.6;
  /* 回退：限制最大高度为两行，避免单行撑开 */
  max-height: calc(1.6em * 2);
}

/* Tooltip样式 */
.tooltip {
  position: relative;
  cursor: default;
}

.tooltip:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  left: 0;
  bottom: -30%;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  margin-top: 5px;
  max-width: 300px;
  word-break: break-all;
  white-space: normal;
}
.dark .tooltip:hover::after{
  background: #333333;
}
</style>